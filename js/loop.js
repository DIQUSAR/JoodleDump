// игровой цикл

let _tickTime    = 0;
let _loopRunning = false;

function loop() {
    if (GameState.phase !== 'playing') { GameState.loopRunning = false; return; }
    if (GameState.loopRunning) return;
    GameState.loopRunning = true;

    function _tick() {
        if (GameState.phase !== 'playing') { GameState.loopRunning = false; return; }

        _tickTime = performance.now() / 1000;

        PlayerSprite.updateGlow();
        update();
        drawBackground();

        ctx.save();
        ctx.translate(0, -cameraY);
        for (const p of GameState.platforms) {
            const screenY = p.y - cameraY;
            if (screenY > H + p.h || screenY + p.h < -20) continue;
            drawPlatform(p);
        }
        Diamonds.draw(_tickTime);
        drawPlayer(GameState.player);
        ctx.restore();

        Diamonds.update(_tickTime);
        Particles.update();

        GameState.rafId = requestAnimationFrame(_tick);
    }

    GameState.rafId = requestAnimationFrame(_tick);
}
