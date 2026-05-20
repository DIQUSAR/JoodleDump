// АУДИО-МЕНЕДЖЕР — Web Audio API
//
// Архитектура двухфазная:
//
//   Фаза 1 — fetch (без жеста, сразу при загрузке страницы):
//     Все аудиофайлы скачиваются в _rawBuffers как ArrayBuffer.
//     AudioContext ещё не создан — браузер не возражает против fetch.
//
//   Фаза 2 — decode (после первого жеста пользователя):
//     AudioContext создаётся, все _rawBuffers декодируются разом.
//     decodeAudioData не блокирует main thread — браузер делает это
//     в фоновом потоке.
//
// Результат: к моменту нажатия Старт все треки уже декодированы,
// переключение музыки мгновенное, без тишины и подгрузок.

const AUDIO_CONFIG = {
    menu:    { src: 'audio/audio_menu.mp3',    volume: 0.20, loop: true  },
    game:    { src: 'audio/audio_game.mp3',    volume: 0.20, loop: true  },
    jump:    { src: 'audio/audio_jump.mp3',    volume: 0.17, loop: false },
    diamond: { src: 'audio/audio_diamond.mp3', volume: 0.17, loop: false },
};

const Audio = (() => {

    let _ctx        = null;
    let _masterGain = null;
    let _buffers    = {};      // name → AudioBuffer (готовы после decode)
    let _rawBuffers = {};      // name → ArrayBuffer (готовы после fetch)
    let _bgSource   = null;
    let _bgName     = null;
    let _muted      = false;
    let _ctxReady   = false;   // true после первого жеста
    let _forcePause = false;

    try { _muted = localStorage.getItem('dj_muted') === 'true'; } catch (_) {}

    // ── Фаза 1: fetch всех треков сразу при загрузке ─────────────
    // Запускается немедленно, без жеста. Браузер разрешает fetch из
    // фоновой вкладки — ресурсы скачиваются пока пользователь читает
    // описание игры на странице Яндекс Игр.

    function _fetchAll() {
        Object.entries(AUDIO_CONFIG).forEach(([name, cfg]) => {
            fetch(cfg.src)
                .then(r => r.arrayBuffer())
                .then(ab => { _rawBuffers[name] = ab; })
                .catch(e => console.warn('[Audio] fetch failed:', name, e));
        });
    }

    // ── Фаза 2: decode всех треков после первого жеста ───────────

    function _ensureCtx() {
        if (_ctx) return;
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
        _masterGain = _ctx.createGain();
        _masterGain.gain.value = _muted ? 0 : 1;
        _masterGain.connect(_ctx.destination);
    }

    // Декодирует один трек. Если raw ещё не скачан — ждёт через fetch.
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

    // ── Воспроизведение ──────────────────────────────────────────

    function _stopBg() {
        if (_bgSource) {
            try { _bgSource.stop(); } catch (_) {}
            _bgSource.disconnect();
            _bgSource = null;
        }
    }

    function _playBgBuffer(name, buffer) {
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
        src.start(0);
        _bgSource = src;
    }

    // ── Публичный API ─────────────────────────────────────────────

    // Вызывается после первого жеста. Создаёт AudioContext и декодирует
    // все треки которые уже успели скачаться (обычно все — прошло время
    // пока пользователь смотрел на экран загрузки).
    function init() {
        if (_ctxReady) return;
        _ctxReady = true;
        _ensureCtx();
        if (_ctx.state === 'suspended') _ctx.resume();
        _decodeAll();
        if (_bgName) {
            _decode(_bgName).then(buf => _playBgBuffer(_bgName, buf)).catch(() => {});
        }
    }

    function switchTo(name) {
        _bgName = name;
        if (!_ctxReady || _forcePause) return;

        if (_buffers[name]) {
            _stopBg();
            _playBgBuffer(name, _buffers[name]);
        } else {
            // декодирование ещё идёт — не останавливаем текущий трек,
            // переключаем когда буфер готов
            _decode(name).then(buf => {
                if (_bgName !== name) return;
                _stopBg();
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
        _decode(_bgName).then(buf => _playBgBuffer(_bgName, buf)).catch(() => {});
    }

    function pause() { _stopBg(); }

    function systemPause() {
        _forcePause = true;
        _stopBg();
    }

    function forceResume() {
        _forcePause = false;
        if (_ctx && _ctx.state === 'suspended') _ctx.resume();
    }

    function systemResume() {
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

    // запускаем fetch немедленно при загрузке модуля
    _fetchAll();

    return {
        init, switchTo, switchToIfNeeded, playSfx,
        play, pause, forceResume, systemPause, systemResume,
        setResumeGuard, toggleMute, isMuted,
    };
})();

// переключение вкладки
document.addEventListener('visibilitychange', () => {
    document.hidden ? Audio.systemPause() : Audio.systemResume();
});

// потеря фокуса окна
window.addEventListener('blur',  () => Audio.systemPause());
window.addEventListener('focus', () => Audio.systemResume());
