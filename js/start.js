// УПРАВЛЕНИЕ СОСТОЯНИЯМИ ИГРЫ

// Синхронизировать текст кнопки звука
// Делегируем обновление кнопки звука в ui_config
function _syncMuteBtn(btn) { updateMuteBtnUI(btn); }

// HTML блока схем управления
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

function _hideHUD() {
    scoreEl.style.display   = 'none';
    highEl.style.display    = 'none';
    diamondEl.style.display = 'none';
}

function _showHUD() {
    scoreEl.style.display   = '';
    highEl.style.display    = '';
    diamondEl.style.display = '';
    diamondEl.innerHTML     = DIAMOND_CFG.uiIcon + ' ' + Currency.get();
}

// Инициализация статического UI (первый запуск страницы)
function initStaticUI() {
    // Живое обновление HUD-баланса при каждом изменении валюты
    Currency.onChange(balance => {
        if (diamondEl.style.display !== 'none') {
            diamondEl.innerHTML = DIAMOND_CFG.uiIcon + ' ' + balance;
        }
    });

    // Применить конфиг к статичным элементам (#pauseBtn, #controls и др.)
    applyUIConfig(document);

    showMenu();
}

// Главное меню
function updateMenuRecord() {
    const el = document.getElementById('menuRecord');
    if (el) el.textContent = '🏆 ' + I18n.t('highScore') + ' ' + highScore;
}

function showMenu() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    _loopRunning = false;
    state = 'idle';

    SDK.Gameplay.stop();

    ctrlDiv.style.display     = 'none';
    pauseBtn.style.display    = 'none';
    pauseScreen.style.display = 'none';
    drawMenuBackground();
    overlay.style.display     = 'flex';

    _hideHUD();

    // Рекорд показываем ВНУТРИ overlay, прямо над кнопкой Старт
    const recordHTML = `<p class="menu-record" id="menuRecord"> ${I18n.t('highScore')} ${highScore}</p>`;

    overlay.innerHTML = `
        <h1>${I18n.t('title').replace('\n','<br>')}</h1>
        <div class="legend">
            <div class="li"><div class="ld" style="background:#5cb85c;"></div>${I18n.t('platNormal')}</div>
            <div class="li"><div class="ld" style="background:#f0a030;"></div>${I18n.t('platOneshot')}</div>
            <div class="li"><div class="ld" style="background:#e84040;"></div>${I18n.t('platFragile')}</div>
            <div class="li"><div class="ld" style="background:#2196f3;"></div>${I18n.t('platMoving')}</div>
        </div>
        ${_ctrlSchemeHTML()}
        ${recordHTML}
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

    // сигналим SDK что игра готова — меню отрисовано, пользователь может взаимодействовать
    SDK.notifyReady();
}

// Старт игры
function startGame() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    _loopRunning = false;

    player    = makePlayer();
    player.vy = JUMP_V;
    score     = 0;
    cameraY   = 0;
    particles = [];
    popups    = [];
    resetDiamonds();
    keys      = { left: false, right: false };

    Audio.forceResume();
    // forceResume сбрасывает _forcePause если браузер послал blur
    // прямо перед рестартом (тап по кнопке = blur + click на мобильных).
    // Без этого switchTo молча выходит и весь звук пропадает.
    Audio.switchTo('game');
    Leaderboard.resetRound(); // сброс флага отправки результата

    spawnInitialPlatforms();

    state = 'playing';
    overlay.style.display     = 'none';
    pauseScreen.style.display = 'none';
    ctrlDiv.style.display     = ctrlScheme === 'screen' ? 'flex' : 'none';
    pauseBtn.style.display    = 'flex';
    updatePauseBtnUI(false);

    // Показать HUD только во время игры
    _showHUD();
    scoreEl.textContent = '0';
    highEl.textContent  = I18n.t('highScore') + highScore;

    SDK.Gameplay.start();

    loop();
}

// Пауза
function pauseGame() {
    if (state !== 'playing') return;
    state = 'paused';
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    _loopRunning = false;
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
    if (state !== 'paused') return;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    _loopRunning = false;
    state = 'playing';
    pauseScreen.style.display = 'none';
    updatePauseBtnUI(false);
    Audio.play();
    SDK.Gameplay.start();
    loop();
}

pauseBtn.addEventListener('click', () => {
    if (state === 'playing') pauseGame();
    else if (state === 'paused') resumeGame();
});

// Экран предложения возродиться за рекламу
function _renderReviveOffer() {
    drawMenuBackground();
    overlay.style.display = 'flex';

    overlay.innerHTML = `
        <h1>${I18n.t('deathTitle')}</h1>
        <p class="sub" style="font-size:18px;color:#444;margin:4px 0 16px;">
            ${I18n.t('scoreLabel')}<b>${score}</b>
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

// Возрождение игрока на сохранённой точке
function _revivePlayer() {
    if (!reviveSavePoint) { startGame(); return; }

    // Восстанавливаем позицию игрока
    player    = makePlayer();
    player.x  = reviveSavePoint.x;
    player.y  = reviveSavePoint.y;
    player.vy = JUMP_V;  // импульс вверх сразу после возрождения
    player.vx = 0;
    cameraY   = reviveSavePoint.cameraY;

    // Перестройка платформ вокруг точки возрождения
    const safeX = Math.min(Math.max(player.x - 31, 0), W - 62);
    const safeY = player.y + 40; // чуть ниже ног

    // Сбрасываем все старые платформы и генерируем новые от точки возрождения вверх
    platforms = [];
    lastGenType = 'normal';
    resetDiamonds();

    // Опорная платформа под игроком — всегда normal
    platforms.push(makePlatform(safeX, safeY, 'normal'));

    let py = safeY;
    for (let i = 0; i < 14; i++) {
        py -= 70 + Math.random() * 55;
        platforms.push(makePlatform(
            Math.random() * (W - 70),
            py,
            pickType(score)
        ));
    }

    reviveSavePoint = null;  // одноразовое возрождение

    Audio.systemResume();
    Audio.switchToIfNeeded('game');

    _loopRunning = false;
    state = 'playing';
    overlay.style.display     = 'none';
    pauseScreen.style.display = 'none';
    ctrlDiv.style.display     = ctrlScheme === 'screen' ? 'flex' : 'none';
    pauseBtn.style.display    = 'flex';
    updatePauseBtnUI(false);

    _showHUD();
    scoreEl.textContent = score;
    highEl.textContent  = I18n.t('highScore') + highScore;

    SDK.Gameplay.start();

    loop();
}

// Рисует экран результата — вызывается после рекламы (или сразу если SDK нет)
function _renderGameOver() {
    // Обновить локальный рекорд и сохранить в localStorage
    if (score > highScore) {
        highScore = score;
        try { localStorage.setItem('dj_highscore', highScore); } catch (_) {}
        if (typeof YandexSync !== 'undefined') YandexSync.save();
    }

    Leaderboard.setScore(highScore);

    drawMenuBackground();
    overlay.style.display = 'flex';

    const isRecord = score > 0 && score >= highScore;
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

// Экран смерти
function showGameOver() {
    SDK.Gameplay.stop();
    Audio.systemPause();

    ctrlDiv.style.display     = 'none';
    pauseBtn.style.display    = 'none';
    pauseScreen.style.display = 'none';
    _hideHUD();

    // Сохраняем точку возрождения прямо в момент смерти.
    reviveSavePoint = {
        x:       player.x,
        y:       player.y - 60,
        cameraY: cameraY,
    };

    _renderReviveOffer();
}

// Экран лидерборда
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

// Экран настроек
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

// Музыка после закрытия рекламы/потери фокуса возобновляется
// только если идёт геймплей — не на паузе и не в меню.
Audio.setResumeGuard(() => state === 'playing');

// Синхронизация прогресса с Яндекс облаком.
// Вызываем после initStaticUI, чтобы все модули (Currency, Passives, Shop)
// уже были в памяти с локальными данными — тогда mergeLevels/mergeOwned
// корректно сравнивают облачные данные с текущими.
YandexSync.init();

async function initSdkAudioEvents() {
    const sdk = await SDK.get();
    if (!sdk?.on) return;
    sdk.on('popup_opened', () => Audio.systemPause());
    sdk.on('popup_closed', () => Audio.systemResume());
}
initSdkAudioEvents();
I18n.initFromSDK();      // подхватить язык из SDK после его загрузки
Leaderboard.syncHighScore(); // подтянуть рекорд с сервера


