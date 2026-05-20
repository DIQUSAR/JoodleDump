// Время текущего тика в секундах — вычисляется один раз, используется в
// updateDiamonds() и drawDiamonds() вместо двух отдельных performance.now()
let _tickTime = 0;

let _loopRunning = false;

function loop() {
    if (state !== 'playing') { _loopRunning = false; return; }
    if (_loopRunning) return;
    _loopRunning = true;

    function _tick() {
        if (state !== 'playing') { _loopRunning = false; return; }

        _tickTime = performance.now() / 1000;

        PlayerSprite.updateGlow();
        update();
        drawBackground();
        ctx.save();
        ctx.translate(0, -cameraY);
        for (const p of platforms) {
            const screenY = p.y - cameraY;
            if (screenY > H + p.h || screenY + p.h < -20) continue;
            drawPlatform(p);
        }
        drawDiamonds();
        drawPlayer(player);
        updateParticles();
        ctx.restore();

        updateDiamonds();
        updatePopups();

        rafId = requestAnimationFrame(_tick);
    }

    rafId = requestAnimationFrame(_tick);
}
