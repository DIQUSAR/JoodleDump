// координатор состояний игры

function _ctrlSchemeHTML() {
    const s = ctrlScheme;
    return `
        <div class="ctrl-scheme" id="ctrlScheme">
            <button class="ctrl-scheme-btn ${s === 'keyboard' ? 'active' : ''}" data-scheme="keyboard">${I18n.t('ctrlKeyboard').replace('\n', '<br>')}</button>
            <button class="ctrl-scheme-btn ${s === 'screen'   ? 'active' : ''}" data-scheme="screen">${I18n.t('ctrlScreen').replace('\n', '<br>')}</button>
            <button class="ctrl-scheme-btn ${s === 'gyro'     ? 'active' : ''}" data-scheme="gyro">${I18n.t('ctrlGyro').replace('\n', '<br>')}</button>
        </div>
    `;
}

// requestPermission вызывается максимально близко к жесту — без вложенных async-лямбд
async function _onCtrlBtnClick(btn, container) {
    const scheme = btn.dataset.scheme;
    if (scheme === 'gyro') {
        const result = await requestGyroPermission();
        if (result === 'denied')      { btn.innerHTML = I18n.t('gyroDenied');  return; }
        if (result === 'unavailable') { btn.innerHTML = I18n.t('gyroUnavail'); return; }
    }
    ctrlScheme = scheme;
    try { localStorage.setItem('dj_ctrl', scheme); } catch (_) {}
    container.querySelectorAll('.ctrl-scheme-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.scheme === scheme);
    });
}

function _bindCtrlScheme() {
    const container = document.getElementById('ctrlScheme');
    if (!container) return;
    container.querySelectorAll('.ctrl-scheme-btn').forEach(btn => {
        btn.addEventListener('click', () => _onCtrlBtnClick(btn, container));
    });
}

const pauseBtn    = document.getElementById('pauseBtn');
const pauseScreen = document.getElementById('pauseScreen');

function initStaticUI() {
    HUD.init();
    // #btnLeft и #btnRight находятся вне overlay — применяем иконки один раз при старте
    applyUIConfig(ctrlDiv);
    showMenu();
}

function startGame() {
    if (GameState.rafId) cancelAnimationFrame(GameState.rafId);
    GameState.rafId       = null;
    GameState.loopRunning = false;

    setState({
        score:     0,
        cameraY:   0,
        particles: [],
        popups:    [],
        keys:      { left: false, right: false },
    });
    GameState.player    = makePlayer();
    GameState.player.vy = JUMP_V;
    Diamonds.reset();

    setScoreBase(0, 0);
    // init создаёт AudioContext и запускает декодирование если ещё не запущено
    Audio.init();
    Audio.forceResume();
    Audio.switchTo('game');
    Leaderboard.resetRound();

    spawnInitialPlatforms();

    setPhase('playing');
    overlay.style.display     = 'none';
    pauseScreen.style.display = 'none';
    ctrlDiv.style.display     = ctrlScheme === 'screen' ? 'flex' : 'none';
    pauseBtn.style.display    = 'flex';
    updatePauseBtnUI(false);

    HUD.show();
    HUD.setScore(0);
    HUD.setHigh(GameState.highScore);

    SDK.Gameplay.start();
    loop();
}

pauseBtn.addEventListener('click', () => {
    if (GameState.phase === 'playing') pauseGame();
    else if (GameState.phase === 'paused') resumeGame();
});

// инициализируем UI только после того, как SDK готов
// это гарантирует что notifyReady() в showMenu() вызовется уже после resolve
Promise.all([
    window.yandexSDKPromise,
    document.fonts.ready,
    Preloader.run(),
    // язык из SDK определяется до отрисовки UI
    window.yandexSDKPromise.then(() => I18n.initFromSDK()),
    // облачные данные (счёт, валюта, скины) ждём до показа меню
    window.yandexSDKPromise.then(() => YandexSync.init()),
]).then(() => {
    const el = document.getElementById('loadingScreen');
    if (el) el.style.display = 'none';
    initStaticUI();
});

Audio.setResumeGuard(() => GameState.phase === 'playing' || GameState.phase === 'idle');

// декодируем аудио-буферы по первому жесту пользователя
// к этому моменту ArrayBuffer уже загружен — decode быстрый
(function _setupEarlyDecode() {
    function _onFirstGesture() {
        Audio.decodeAll();
        document.removeEventListener('pointerdown', _onFirstGesture);
        document.removeEventListener('keydown',     _onFirstGesture);
    }
    document.addEventListener('pointerdown', _onFirstGesture, { once: true });
    document.addEventListener('keydown',     _onFirstGesture, { once: true });
})();


async function _initSdkAudioEvents() {
    const sdk = await SDK.get();
    if (!sdk?.on) return;
    sdk.on('popup_opened', () => Audio.systemPause());
    sdk.on('popup_closed', () => Audio.systemResume());
}
_initSdkAudioEvents();
Leaderboard.syncHighScore();
