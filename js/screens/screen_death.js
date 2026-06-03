function showGameOverScreen() {
    const { score } = GameState;
    const isRecord = score > 0 && score > GameState.highScore;
    if (isRecord) {
        GameState.highScore = score;
        try { localStorage.setItem('dj_highscore', score); } catch (_) {}
        if (typeof YandexSync !== 'undefined') YandexSync.save();
    }

    Leaderboard.setScore(GameState.highScore);
    drawMenuBackground();
    overlay.style.display = 'flex';

    overlay.innerHTML = `
        <h1>${I18n.t('deathTitle')}</h1>
        <p class="sub" style="font-size:20px;color:#444;">
            ${I18n.t('scoreLabel')}<b>${score}</b>${isRecord ? `<br><span id="newRecordLabel">${I18n.t('newRecord')}</span>` : ''}
        </p>
        <div style="display:flex;gap:12px;margin-top:8px;">
            <button id="btnRetry">${I18n.t('btnRetry')}</button>
            <button id="btnMenu">${I18n.t('btnMenu')}</button>
        </div>
    `;
    document.getElementById('btnRetry').addEventListener('click', () => startGame());
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

    // флаг для revivePlayer — факт смерти без reviveSavePoint = startGame()
    GameState.reviveSavePoint = { cameraY: GameState.cameraY };

    showReviveOffer();
}
