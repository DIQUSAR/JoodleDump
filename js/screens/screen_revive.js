// экран предложения возрождения и логика возрождения

function showReviveOffer() {
    drawMenuBackground();
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <h1>${I18n.t('deathTitle')}</h1>
        <p class="sub" style="font-size:18px;color:#444;margin:4px 0 16px;">
            ${I18n.t('scoreLabel')}<b>${GameState.score}</b>
        </p>
        <p id="reviveOfferText" style="font-size:15px;color:#555;margin-bottom:16px;">${I18n.t('reviveOffer')}</p>
        <div><button id="btnRevive"     class="menu-btn">${I18n.t('btnRevive')}</button></div>
        <div><button id="btnSkipRevive" class="menu-btn">${I18n.t('btnSkipRevive')}</button></div>
    `;
    document.getElementById('btnRevive').addEventListener('click', () => {
        let rewarded = false;
        Adv.showRewarded({
            onRewarded: () => { rewarded = true; revivePlayer(); },
            onClose:    () => { if (!rewarded) showGameOverScreen(); },
        });
    });
    document.getElementById('btnSkipRevive').addEventListener('click', showGameOverScreen);
    applyUIConfig(overlay);
}

function revivePlayer() {
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
    Diamonds.reset();

    GameState.platforms.push(makeGamePlatform(safeX, safeY, 'normal', GameState.score));
    let py = safeY;
    for (let i = 0; i < 14; i++) {
        py -= 70 + Math.random() * 55;
        GameState.platforms.push(makeGamePlatform(
            Math.random() * (W - 70), py,
            pickType(GameState.score), GameState.score
        ));
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
