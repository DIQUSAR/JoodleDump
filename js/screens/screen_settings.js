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
                <button id="settingsDarkBtn" class="menu-btn"></button>
                <button id="settingsLangBtn" class="menu-btn">${I18n.t('langBtn')}</button>
            </div>
        </div>
    `;
    updateMuteBtnUI(document.getElementById('settingsMuteBtn'));
    updateDarkBtnUI(document.getElementById('settingsDarkBtn'));

    document.getElementById('settingsMuteBtn').addEventListener('click', () => {
        Audio.init();
        Audio.toggleMute();
        updateMuteBtnUI(document.getElementById('settingsMuteBtn'));
    });
    document.getElementById('settingsDarkBtn').addEventListener('click', () => {
        Theme.toggle();
        drawMenuBackground();
        updateDarkBtnUI(document.getElementById('settingsDarkBtn'));
    });
    document.getElementById('settingsLangBtn').addEventListener('click', () => {
        I18n.toggle();
        showSettings();
    });
    document.getElementById('btnSettingsBack').addEventListener('click', showMenu);
    applyUIConfig(overlay);
}
