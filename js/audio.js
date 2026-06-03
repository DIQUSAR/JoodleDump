// аудио-менеджер — web audio api

const AUDIO_CONFIG = {
    menu:    { src: 'audio/audio_menu.mp3',    volume: 0.20, loop: true  },
    game:    { src: 'audio/audio_game.mp3',    volume: 0.20, loop: true  },
    jump:    { src: 'audio/audio_jump.mp3',    volume: 0.17, loop: false },
    diamond: { src: 'audio/audio_diamond.mp3', volume: 0.17, loop: false },
};

const Audio = (() => {

    let _ctx        = null;
    let _masterGain = null;
    let _buffers    = {};
    let _rawBuffers = {};
    let _bgSource    = null;
    let _bgName      = null;
    let _muted       = false;
    let _ctxReady    = false;
    let _forcePause  = false;
    let _adActive    = false;   // true пока показывается реклама — блокирует focus/systemResume
    let _pauseOffset = 0;   // позиция трека в момент паузы (сек)
    let _pauseStart  = 0;   // ctx.currentTime в момент старта source

    try { _muted = localStorage.getItem('dj_muted') === 'true'; } catch (_) {}

    function _fetchAll() {
        return Promise.all(
            Object.entries(AUDIO_CONFIG).map(([name, cfg]) =>
                fetch(cfg.src)
                    .then(r => r.arrayBuffer())
                    .then(ab => { _rawBuffers[name] = ab; })
                    .catch(e => console.warn('[Audio] fetch failed:', name, e))
            )
        );
    }

    function _ensureCtx() {
        if (_ctx) return;
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
        _masterGain = _ctx.createGain();
        _masterGain.gain.value = _muted ? 0 : 1;
        _masterGain.connect(_ctx.destination);
    }

    function _decode(name) {
        if (_buffers[name]) return Promise.resolve(_buffers[name]);

        const cfg = AUDIO_CONFIG[name];
        if (!cfg) return Promise.reject(new Error('Unknown track: ' + name));

        const source = _rawBuffers[name]
            ? Promise.resolve(_rawBuffers[name])
            : fetch(cfg.src).then(r => r.arrayBuffer());

        return source
            .then(ab => _ctx.decodeAudioData(ab.slice(0)))
            .then(buf => { _buffers[name] = buf; return buf; });
    }

    function _decodeAll() {
        Object.keys(AUDIO_CONFIG).forEach(name => {
            _decode(name).catch(() => {});
        });
    }

    function _stopBg() {
        if (_bgSource) {
            try { _bgSource.stop(); } catch (_) {}
            _bgSource.disconnect();
            _bgSource = null;
        }
    }

    function _playBgBuffer(name, buffer, offset = 0) {
        if (_forcePause || _bgName !== name) return;
        _stopBg();

        const cfg      = AUDIO_CONFIG[name];
        const gainNode = _ctx.createGain();
        gainNode.gain.value = cfg.volume;
        gainNode.connect(_masterGain);

        const src  = _ctx.createBufferSource();
        src.buffer = buffer;
        src.loop   = true;
        src.connect(gainNode);
        // offset по длине буфера чтобы не выйти за пределы
        const safeOffset = buffer.duration > 0 ? offset % buffer.duration : 0;
        src.start(0, safeOffset);
        _pauseStart = _ctx.currentTime;
        _pauseOffset = safeOffset;
        _bgSource = src;
    }

    // вызывается по первому жесту — создаёт ctx и декодирует все буферы
    // повторный вызов безопасен
    function decodeAll() {
        if (_ctxReady) return Promise.resolve();
        _ensureCtx();
        if (_ctx.state === 'suspended') _ctx.resume();
        return Promise.all(
            Object.keys(AUDIO_CONFIG).map(name => _decode(name).catch(() => {}))
        );
    }

    function init() {
        if (_ctxReady) return;
        _ctxReady = true;
        _ensureCtx();
        if (_ctx.state === 'suspended') _ctx.resume();
        _decodeAll();
        // запуск трека — ответственность switchTo / play, не init
    }

    // останавливаем текущий трек немедленно, не ждём декодирования нового.
    // это убирает задержку при переключении menu→game: меню глохнет сразу,
    // игровой трек стартует как только буфер готов.
    function switchTo(name) {
        _bgName = name;
        _pauseOffset = 0;
        _pauseStart  = 0;
        if (!_ctxReady || _forcePause) return;

        _stopBg(); // немедленно — независимо от готовности нового буфера

        if (_buffers[name]) {
            _playBgBuffer(name, _buffers[name]);
        } else {
            _decode(name).then(buf => {
                if (_bgName !== name) return;
                _playBgBuffer(name, buf);
            }).catch(() => {});
        }
    }

    function switchToIfNeeded(name) {
        if (_bgName === name) {
            if (_ctxReady && !_forcePause && !_bgSource) switchTo(name);
            return;
        }
        switchTo(name);
    }

    function playSfx(name) {
        if (_muted || !_ctxReady || _forcePause) return;
        _decode(name).then(buf => {
            const gainNode = _ctx.createGain();
            gainNode.gain.value = AUDIO_CONFIG[name]?.volume ?? 0.2;
            gainNode.connect(_masterGain);
            const src  = _ctx.createBufferSource();
            src.buffer = buf;
            src.connect(gainNode);
            src.start(0);
        }).catch(() => {});
    }

    function play() {
        if (!_ctxReady || !_bgName || _forcePause) return;
        if (_bgSource) return;
        const offset = _pauseOffset;
        _decode(_bgName).then(buf => _playBgBuffer(_bgName, buf, offset)).catch(() => {});
    }

    function pause() {
        if (_bgSource && _ctx) {
            _pauseOffset = (_pauseOffset + _ctx.currentTime - _pauseStart) % ((_bgSource.buffer?.duration || 1));
        }
        _stopBg();
    }

    function systemPause() {
        _forcePause = true;
        _stopBg();
    }

    function beginAd() {
        _adActive = true;
        systemPause();
    }

    function forceResume() {
        _forcePause = false;
        if (_ctx && _ctx.state === 'suspended') _ctx.resume();
    }

    function systemResume() {
        if (_adActive) return;
        _forcePause = false;
        if (_ctx && _ctx.state === 'suspended') _ctx.resume();
        if (_onResumeAllowed && !_onResumeAllowed()) return;
        play();
    }

    // снимает флаги после рекламы и возобновляет воспроизведение если фаза позволяет
    function resumeAfterAd() {
        _adActive   = false;
        _forcePause = false;
        if (_ctx && _ctx.state === 'suspended') _ctx.resume();
        if (_onResumeAllowed && !_onResumeAllowed()) return;
        play();
    }

    let _onResumeAllowed = null;
    function setResumeGuard(fn) { _onResumeAllowed = fn; }

    function toggleMute() {
        _muted = !_muted;
        try { localStorage.setItem('dj_muted', _muted); } catch (_) {}
        if (_masterGain) {
            _masterGain.gain.setTargetAtTime(_muted ? 0 : 1, _ctx.currentTime, 0.05);
        }
        return _muted;
    }

    function isMuted() { return _muted; }

    const _fetchAllPromise = _fetchAll();

    return {
        init, decodeAll, switchTo, switchToIfNeeded, playSfx,
        play, pause, forceResume, systemPause, beginAd, systemResume, resumeAfterAd,
        setResumeGuard, toggleMute, isMuted,
        _fetchAllPromise,
    };
})();

document.addEventListener('visibilitychange', () => {
    document.hidden ? Audio.systemPause() : Audio.systemResume();
});

window.addEventListener('blur',  () => Audio.systemPause());
window.addEventListener('focus', () => Audio.systemResume());
