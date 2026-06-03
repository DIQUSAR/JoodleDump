// экран предложения возрождения и логика возрождения

function showReviveOffer() {
    drawMenuBackground();
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <h1>${I18n.t('deathTitle')}</h1>
        <p class="sub" style="font-size:18px;color:#444;margin:4px 0 16px;">
            ${I18n.t('scoreLabel')}<b>${GameState.score}</b>
        </p>
        <p id="reviveOfferText" style="font-size:15px;color:#555;margin-bottom:16px;">
            <span data-revive-icon style="margin-right:4px">👁</span>${I18n.t('reviveOffer')}
        </p>
        <div><button id="btnRevive"     class="menu-btn">${I18n.t('btnRevive')}</button></div>
        <div><button id="btnSkipRevive" class="menu-btn">${I18n.t('btnSkipRevive')}</button></div>
    `;
    document.getElementById('btnRevive').addEventListener('click', () => {
        let rewarded = false;
        Adv.showRewarded({
            onRewarded: () => { rewarded = true; try { Shop.onAdWatched(); } catch (_) {} revivePlayer(); },
            onClose:    () => { if (!rewarded) showGameOverScreen(); },
        });
    });
    document.getElementById('btnSkipRevive').addEventListener('click', showGameOverScreen);
    applyUIConfig(overlay);
}

function revivePlayer() {
    if (!GameState.reviveSavePoint) { startGame(); return; }

    // игрок и стартовая платформа всегда по центру
    const platX  = (W - PLAT_W) / 2;
    const platY  = H * 0.65;
    const playerX = W / 2 - (SKINS[activeSkin]?.w ?? 44) / 2;
    const playerY = platY - 48;

    const p = makePlayer();
    p.x  = playerX;
    p.y  = playerY;
    p.vy = JUMP_V;
    p.vx = 0;

    // cameraY: игрок на 38% высоты экрана
    const cameraY = playerY - H * 0.38;

    setState({ player: p, cameraY, reviveSavePoint: null });
    // запоминаем cameraY и score на момент revive,
    // чтобы счёт продолжался от текущего значения а не падал
    setScoreBase(GameState.score, cameraY);

    GameState.platforms = [];
    lastGenType = 'normal';
    Diamonds.reset();

    // одна гарантированная платформа по центру
    GameState.platforms.push(makeGamePlatform(platX, platY, 'normal', GameState.score));
    // сбрасываем _topPlatY чтобы generateMore сразу добрал платформы выше
    resetTopPlatY(platY);


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
