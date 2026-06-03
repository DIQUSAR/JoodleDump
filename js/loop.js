// игровой цикл
// fixed-step accumulator: логика всегда шагает по FIXED_DT секунд,
// независимо от реального fps (30 / 60 / 120 hz — одинаковое поведение)

const LOOP_CFG = {
    FIXED_DT:    1 / 60,   // шаг физики в секундах
    MAX_DELTA:   0.05,     // потолок delta — защита от спайков при сворачивании вкладки
};

function loop() {
    if (GameState.phase !== 'playing') { GameState.loopRunning = false; return; }
    if (GameState.loopRunning) return;
    GameState.loopRunning = true;

    let _lastTime = performance.now();
    let _accumulator = 0;

    function _tick(now) {
        if (GameState.phase !== 'playing') { GameState.loopRunning = false; return; }

        const rawDelta = (now - _lastTime) / 1000;
        _lastTime = now;
        _accumulator += Math.min(rawDelta, LOOP_CFG.MAX_DELTA);

        GameState.tickTime = now / 1000;
        PlayerSprite.updateGlow();

        // фиксированные шаги физики — столько, сколько накопилось
        while (_accumulator >= LOOP_CFG.FIXED_DT) {
            update(LOOP_CFG.FIXED_DT);
            _accumulator -= LOOP_CFG.FIXED_DT;
        }

        // обновление состояний до рендера — алмазы и частицы не отстают на кадр
        Diamonds.update(GameState.tickTime);

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

        Particles.update();

        GameState.rafId = requestAnimationFrame(_tick);
    }

    GameState.rafId = requestAnimationFrame(_tick);
}
