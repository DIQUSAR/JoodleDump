// управление состояниями игры

function _syncMuteBtn(btn) { updateMuteBtnUI(btn); }

function _ctrlSchemeHTML() {
    const s = ctrlScheme;
    return `
        <div class="ctrl-scheme" id="ctrlScheme">
            <button class="ctrl-scheme-btn ${s === 'keyboard' ? 'active' : ''}" data-scheme="keyboard">${I18n.t('ctrlKeyboard').replace('\n','<br>')}</button>
            <button class="ctrl-scheme-btn ${s === 'screen'   ? 'active' : ''}" data-scheme="screen">${I18n.t('ctrlScreen').replace('\n','<br>')}</button>
            <button class="ctrl-scheme-btn ${s === 'gyro'     ? 'active' : ''}" data-scheme="gyro">${I18n.t('ctrlGyro').replace('\n','<br>')}</button>
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

function updateMenuRecord() {
    const el = document.getElementById('menuRecord');
    if (el) el.textContent = '🏆 ' + I18n.t('highScore') + ' ' + GameState.highScore;
}

function showMenu() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    GameState.loopRunning = false;
    setPhase('idle');

    SDK.Gameplay.stop();

    ctrlDiv.style.display     = 'none';
    pauseBtn.style.display    = 'none';
    pauseScreen.style.display = 'none';
    drawMenuBackground();
    overlay.style.display     = 'flex';

    HUD.hide();

    overlay.innerHTML = `
        <h1>${I18n.t('title').replace('\n','<br>')}</h1>
        <div class="legend">
            <div class="li"><div class="ld" style="background:#5cb85c;"></div>${I18n.t('platNormal')}</div>
            <div class="li"><div class="ld" style="background:#f0a030;"></div>${I18n.t('platOneshot')}</div>
            <div class="li"><div class="ld" style="background:#e84040;"></div>${I18n.t('platFragile')}</div>
            <div class="li"><div class="ld" style="background:#2196f3;"></div>${I18n.t('platMoving')}</div>
        </div>
        ${_ctrlSchemeHTML()}
        <p class="menu-record" id="menuRecord"> ${I18n.t('highScore')} ${GameState.highScore}</p>
        <button id="startBtn"  class="menu-btn">${I18n.t('btnStart')}</button>
        <button id="shopBtn"   class="menu-btn">${I18n.t('btnShop')}</button>
        <button id="lbBtn"       class="menu-btn">${I18n.t('btnLeaderboard')}</button>
        <button id="settingsBtn" class="menu-btn">${I18n.t('btnSettings')}</button>
        <div id="showversion" class="gameversion">v.1.5.4</div>
    `;

    document.getElementById('startBtn').addEventListener('click', () => { Audio.init(); startGame(); });
    document.getElementById('shopBtn').addEventListener('click', () => Shop.show());
    document.getElementById('lbBtn').addEventListener('click', showLeaderboard);
    document.getElementById('settingsBtn').addEventListener('click', showSettings);
    _bindCtrlScheme();
    applyUIConfig(overlay);

    Audio.systemResume();
    Audio.switchToIfNeeded('menu');
    SDK.notifyReady();
}

function startGame() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    GameState.loopRunning = false;

    setState({
        player:    makePlayer(),
        score:     0,
        cameraY:   0,
        particles: [],
        popups:    [],
        keys:      { left: false, right: false },
    });
    GameState.player.vy = JUMP_V;
    resetDiamonds();

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

function pauseGame() {
    if (GameState.phase !== 'playing') return;
    setPhase('paused');
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    GameState.loopRunning = false;
    Audio.pause();
    SDK.Gameplay.stop();
    updatePauseBtnUI(true);
    pauseScreen.style.display = 'flex';
    pauseScreen.innerHTML = `
        <h1 id="pauseTitle" style="font-size:36px;color:#222;">${I18n.t('pauseTitle')}</h1>
        <button id="btnResume">${I18n.t('btnResume')}</button>
        <button id="btnRestart">${I18n.t('btnRestart')}</button>
        <button id="btnPauseMenu">${I18n.t('btnMenu')}</button>
    `;
    document.getElementById('btnResume').addEventListener('click', resumeGame);
    document.getElementById('btnRestart').addEventListener('click', () => {
        pauseScreen.style.display = 'none';
        startGame();
    });
    document.getElementById('btnPauseMenu').addEventListener('click', () => {
        pauseScreen.style.display = 'none';
        showMenu();
    });
    applyUIConfig(pauseScreen);
}

function resumeGame() {
    if (GameState.phase !== 'paused') return;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    GameState.loopRunning = false;
    setPhase('playing');
    pauseScreen.style.display = 'none';
    updatePauseBtnUI(false);
    Audio.play();
    SDK.Gameplay.start();
    loop();
}

pauseBtn.addEventListener('click', () => {
    if (GameState.phase === 'playing') pauseGame();
    else if (GameState.phase === 'paused') resumeGame();
});

function _renderReviveOffer() {
    drawMenuBackground();
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <h1>${I18n.t('deathTitle')}</h1>
        <p class="sub" style="font-size:18px;color:#444;margin:4px 0 16px;">
            ${I18n.t('scoreLabel')}<b>${GameState.score}</b>
        </p>
        <p id="reviveOfferText" style="font-size:15px;color:#555;margin-bottom:16px;">${I18n.t('reviveOffer')}</p>
        <div><button id="btnRevive" class="menu-btn">${I18n.t('btnRevive')}</button></div>
        <div><button id="btnSkipRevive" class="menu-btn">${I18n.t('btnSkipRevive')}</button></div>
    `;
    document.getElementById('btnRevive').addEventListener('click', () => {
        let rewarded = false;
        Adv.showRewarded({
            onRewarded: () => { rewarded = true; _revivePlayer(); },
            onClose:    () => { if (!rewarded) _renderGameOver(); },
        });
    });
    document.getElementById('btnSkipRevive').addEventListener('click', () => { _renderGameOver(); });
    applyUIConfig(overlay);
}

function _revivePlayer() {
    if (!GameState.reviveSavePoint) { startGame(); return; }

    const sp = GameState.reviveSavePoint;
    const p  = makePlayer();
    p.x  = sp.x;
    p.y  = sp.y;
    p.vy = JUMP_V;
    p.vx = 0;

    setState({ player: p, cameraY: sp.cameraY, reviveSavePoint: null });

    const safeX = Math.min(Math.max(p.x - 31, 0), W - 62);
    const safeY = p.y + 40;

    GameState.platforms = [];
    lastGenType = 'normal';
    resetDiamonds();

    platforms.push(makePlatform(safeX, safeY, 'normal'));
    let py = safeY;
    for (let i = 0; i < 14; i++) {
        py -= 70 + Math.random() * 55;
        platforms.push(makePlatform(Math.random() * (W - 70), py, pickType(GameState.score)));
    }

    Audio.systemResume();
    Audio.switchToIfNeeded('game');

    GameState.loopRunning = false;
    setPhase('playing');
    overlay.style.display     = 'none';
    pauseScreen.style.display = 'none';
    ctrlDiv.style.display     = ctrlScheme === 'screen' ? 'flex' : 'none';
    pauseBtn.style.display    = 'flex';
    updatePauseBtnUI(false);

    HUD.show();
    HUD.setScore(GameState.score);
    HUD.setHigh(GameState.highScore);

    SDK.Gameplay.start();
    loop();
}

function _renderGameOver() {
    const { score, highScore } = GameState;
    if (score > highScore) {
        GameState.highScore = score;
        try { localStorage.setItem('dj_highscore', score); } catch (_) {}
        if (typeof YandexSync !== 'undefined') YandexSync.save();
    }

    Leaderboard.setScore(GameState.highScore);

    drawMenuBackground();
    overlay.style.display = 'flex';

    const isRecord = score > 0 && score >= GameState.highScore;
    overlay.innerHTML = `
        <h1>${I18n.t('deathTitle')}</h1>
        <p class="sub" style="font-size:20px;color:#444;">
            ${I18n.t('scoreLabel')}<b>${score}</b>${isRecord ? '<br>' + I18n.t('newRecord') : ''}
        </p>
        <div style="display:flex;gap:12px;margin-top:8px;">
            <button id="btnRetry">${I18n.t('btnRetry')}</button>
            <button id="btnMenu">${I18n.t('btnMenu')}</button>
        </div>
    `;
    document.getElementById('btnRetry').addEventListener('click', () => { Audio.init(); startGame(); });
    document.getElementById('btnMenu').addEventListener('click', () => {
        Adv.showFullscreen({ onClose: () => showMenu() });
    });
    applyUIConfig(overlay);
}

function showGameOver() {
    SDK.Gameplay.stop();
    Audio.systemPause();

    ctrlDiv.style.display     = 'none';
    pauseBtn.style.display    = 'none';
    pauseScreen.style.display = 'none';
    HUD.hide();

    setState({
        reviveSavePoint: {
            x:       GameState.player.x,
            y:       GameState.player.y - 60,
            cameraY: GameState.cameraY,
        },
    });

    _renderReviveOffer();
}

function showLeaderboard() {
    drawMenuBackground();
    overlay.innerHTML = `
        <div class="shop-wrap">
            <div class="shop-header">
                <button id="btnLBBack" class="shop-back-btn">✕</button>
                <h2 id="lbTitle" style="font-family:inherit;font-size:26px;margin:0;">${I18n.t('lbTitle')}</h2>
                <div style="width:34px;"></div>
            </div>
            <div id="lbContainer" style="width:100%;max-width:320px;min-height:120px;padding:0 16px;overflow-y:auto;"></div>
        </div>
    `;
    document.getElementById('btnLBBack').addEventListener('click', showMenu);
    Leaderboard.showTopEntries(document.getElementById('lbContainer'), 10);
    applyUIConfig(overlay);
}

function showSettings() {
    drawMenuBackground();
    overlay.innerHTML = `
        <div class="shop-wrap">
            <div class="shop-header">
                <button id="btnSettingsBack" class="shop-back-btn">✕</button>
                <h2 id="settingsTitle" style="font-family:inherit;font-size:28px;margin:0;">${I18n.t('settingsTitle')}</h2>
                <div style="width:34px;"></div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:8px 16px 16px;">
                <button id="settingsMuteBtn" class="menu-btn"></button>
                <button id="settingsLangBtn" class="menu-btn">${I18n.t('langBtn')}</button>
            </div>
        </div>
    `;
    updateMuteBtnUI(document.getElementById('settingsMuteBtn'));
    document.getElementById('settingsMuteBtn').addEventListener('click', () => {
        Audio.init();
        Audio.toggleMute();
        _syncMuteBtn(document.getElementById('settingsMuteBtn'));
    });
    document.getElementById('settingsLangBtn').addEventListener('click', () => {
        I18n.toggle();
        showSettings();
    });
    document.getElementById('btnSettingsBack').addEventListener('click', showMenu);
    applyUIConfig(overlay);
}

initStaticUI();

Audio.setResumeGuard(() => GameState.phase === 'playing');

YandexSync.init();

async function initSdkAudioEvents() {
    const sdk = await SDK.get();
    if (!sdk?.on) return;
    sdk.on('popup_opened', () => Audio.systemPause());
    sdk.on('popup_closed', () => Audio.systemResume());
}
initSdkAudioEvents();
I18n.initFromSDK();
Leaderboard.syncHighScore();
