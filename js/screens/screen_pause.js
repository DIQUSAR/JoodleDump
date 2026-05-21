// экран паузы

function pauseGame() {
    if (GameState.phase !== 'playing') return;
    setPhase('paused');
    if (GameState.rafId) { cancelAnimationFrame(GameState.rafId); GameState.rafId = null; }
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
    if (GameState.rafId) { cancelAnimationFrame(GameState.rafId); GameState.rafId = null; }
    GameState.loopRunning = false;
    setPhase('playing');
    pauseScreen.style.display = 'none';
    updatePauseBtnUI(false);
    Audio.play();
    SDK.Gameplay.start();
    loop();
}
