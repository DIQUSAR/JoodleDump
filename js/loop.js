// игровой цикл

function loop() {
    if (GameState.phase !== 'playing') { GameState.loopRunning = false; return; }
    if (GameState.loopRunning) return;
    GameState.loopRunning = true;

    function _tick() {
        if (GameState.phase !== 'playing') { GameState.loopRunning = false; return; }

        GameState.tickTime = performance.now() / 1000;

        PlayerSprite.updateGlow();
        update();
        drawBackground();

        ctx.save();
        ctx.translate(0, -GameState.cameraY);
        for (const p of GameState.platforms) {
            const screenY = p.y - GameState.cameraY;
            if (screenY > H + p.h || screenY + p.h < -20) continue;
            drawPlatform(p);
        }
        Diamonds.draw(GameState.tickTime);
        drawPlayer(GameState.player);
        ctx.restore();

        Diamonds.update(GameState.tickTime);
        Particles.update();

        GameState.rafId = requestAnimationFrame(_tick);
    }

    GameState.rafId = requestAnimationFrame(_tick);
}
