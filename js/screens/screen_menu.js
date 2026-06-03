// экран главного меню

function updateMenuRecord() {
    const el = document.getElementById('menuRecord');
    if (!el) return;
    const text = I18n.t('highScore') + ' ' + GameState.highScore;
    // обновляем только текстовые узлы, не трогая icon/gap элементы
    Array.from(el.childNodes)
        .filter(n => n.nodeType === 3)
        .forEach(n => n.remove());
    el.insertAdjacentText('beforeend', text);
}

function _startMenuMusic() {
    try { Audio.init(); Audio.decodeAll(); Audio.switchToIfNeeded('menu'); } catch (_) {}
}

// без init — безопасно вызывать до жеста пользователя
function _resumeMenuMusic() {
    try { Audio.switchToIfNeeded('menu'); } catch (_) {}
}

function showMenu() {
    if (GameState.rafId) cancelAnimationFrame(GameState.rafId);
    GameState.rafId       = null;
    GameState.loopRunning = false;
    setPhase('idle');

    SDK.Gameplay.stop();

    ctrlDiv.style.display     = 'none';
    pauseBtn.style.display    = 'none';
    pauseScreen.style.display = 'none';
    drawMenuBackground();
    applyBodyBackground();
    overlay.style.display     = 'flex';

    HUD.hide();

    overlay.innerHTML = `
        <h1>${I18n.t('title').replace('\n', '<br>')}</h1>
        <div class="legend">
            <div class="li"><div class="ld" style="background:#5cb85c;"></div>${I18n.t('platNormal')}</div>
            <div class="li"><div class="ld" style="background:#f0a030;"></div>${I18n.t('platOneshot')}</div>
            <div class="li"><div class="ld" style="background:#e84040;"></div>${I18n.t('platFragile')}</div>
            <div class="li"><div class="ld" style="background:#2196f3;"></div>${I18n.t('platMoving')}</div>
        </div>
        ${_ctrlSchemeHTML()}
        <p class="menu-record" id="menuRecord">${I18n.t('highScore')} ${GameState.highScore}</p>
        <button id="startBtn"    class="menu-btn">${I18n.t('btnStart')}</button>
        <button id="shopBtn"     class="menu-btn">${I18n.t('btnShop')}</button>
        <button id="lbBtn"       class="menu-btn">${I18n.t('btnLeaderboard')}</button>
        <button id="settingsBtn" class="menu-btn">${I18n.t('btnSettings')}</button>
        <div id="showversion" class="gameversion">v${CONFIG.VERSION}</div>
    `;

    document.getElementById('startBtn').addEventListener('click', () => {
        Audio.init();
        Audio.decodeAll();
        startGame();
    });
    document.getElementById('shopBtn').addEventListener('click', () => { _startMenuMusic(); Shop.show(); });
    document.getElementById('lbBtn').addEventListener('click', () => { _startMenuMusic(); showLeaderboard(); });
    document.getElementById('settingsBtn').addEventListener('click', () => { _startMenuMusic(); showSettings(); });
    _bindCtrlScheme();
    applyUIConfig(overlay);

    _resumeMenuMusic(); // устанавливает _bgName='menu' до systemResume, чтобы play() не поднял game-трек
    Audio.systemResume();
    SDK.notifyReady();
}
