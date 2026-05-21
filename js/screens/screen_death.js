// экран смерти

function showGameOverScreen() {
    const { score } = GameState;
    if (score > GameState.highScore) {
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

// вызывается из physics.js когда игрок упал за экран
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

    showReviveOffer();
}
