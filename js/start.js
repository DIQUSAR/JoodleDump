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

async function _bindCtrlScheme() {
    const container = document.getElementById('ctrlScheme');
    if (!container) return;
    container.querySelectorAll('.ctrl-scheme-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
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
        });
    });
}

const pauseBtn    = document.getElementById('pauseBtn');
const pauseScreen = document.getElementById('pauseScreen');

function initStaticUI() {
    HUD.init();
    applyUIConfig(document);
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
window.yandexSDKPromise.then(() => {
    const el = document.getElementById('loadingScreen');
    if (el) el.style.display = 'none';
    initStaticUI();
});

Audio.setResumeGuard(() => GameState.phase === 'playing');

YandexSync.init();

async function _initSdkAudioEvents() {
    const sdk = await SDK.get();
    if (!sdk?.on) return;
    sdk.on('popup_opened', () => Audio.systemPause());
    sdk.on('popup_closed', () => Audio.systemResume());
}
_initSdkAudioEvents();
I18n.initFromSDK();
Leaderboard.syncHighScore();
