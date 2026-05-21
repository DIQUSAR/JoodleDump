// частицы и всплывающие надписи

const Particles = (() => {

    function spawnParticles(x, y, color) {
        for (let i = 0; i < 7; i++) {
            GameState.particles.push({
                x, y,
                vx:    (Math.random() - 0.5) * 5,
                vy:    -Math.random() * 4 - 1,
                life:  1,
                color,
            });
        }
    }

    // imgSrc — строка пути к спрайту или null.
    // img разрешается внутри через DiamondSprite.get() — вызывающий
    // не обязан знать о внутреннем кэше.
    function spawnPopup(x, y, text, color, imgSrc = null) {
        const img     = imgSrc ? DiamondSprite.get() : null;
        GameState.popups.push({
            x,
            screenY:  y - GameState.cameraY,
            text,
            color,
            life:     1,
            img:      img || null,
            imgReady: img instanceof HTMLImageElement && img.complete,
        });
    }

    function _updateParticles() {
        const list = GameState.particles;
        for (let i = list.length - 1; i >= 0; i--) {
            const p = list[i];
            p.x  += p.vx;
            p.y  += p.vy;
            p.vy += 0.18;
            p.life -= 0.05;
            if (p.life <= 0) {
                list[i] = list[list.length - 1];
                list.pop();
                continue;
            }
            const r = 4.5 * p.life;
            ctx.globalAlpha = p.life;
            ctx.fillStyle   = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    function _updatePopups() {
        const list = GameState.popups;
        for (let i = list.length - 1; i >= 0; i--) {
            if (list[i].life <= 0) { list.splice(i, 1); }
        }
        for (const p of list) {
            p.screenY -= 1.4;
            p.life    -= 0.025;
            if (p.life <= 0) continue;

            ctx.save();
            const fadeIn  = Math.min(1, (1 - p.life) * 5);
            const fadeOut = p.life < 0.4 ? p.life / 0.4 : 1;
            ctx.globalAlpha = Math.min(fadeIn, fadeOut);
            const scale = 0.7 + 0.3 * fadeIn;
            ctx.translate(p.x, p.screenY);
            ctx.scale(scale, scale);

            if (p.imgReady && p.img) {
                const size = 22 * scale;
                ctx.drawImage(p.img, -size / 2, -size / 2, size, size);
                ctx.font         = 'bold 13px Patrick Hand, cursive';
                ctx.textAlign    = 'left';
                ctx.textBaseline = 'middle';
                ctx.lineWidth    = 3;
                ctx.strokeStyle  = 'rgba(255,255,255,0.85)';
                ctx.strokeText('+1', size / 2 + 2, 0);
                ctx.fillStyle    = p.color;
                ctx.fillText('+1', size / 2 + 2, 0);
            } else {
                ctx.font         = 'bold 15px Patrick Hand, cursive';
                ctx.textAlign    = 'center';
                ctx.textBaseline = 'middle';
                ctx.lineWidth    = 4;
                ctx.strokeStyle  = 'rgba(255,255,255,0.85)';
                ctx.strokeText(p.text, 0, 0);
                ctx.fillStyle    = p.color;
                ctx.fillText(p.text, 0, 0);
            }
            ctx.restore();
        }
    }

    function update() {
        _updateParticles();
        _updatePopups();
    }

    return { spawnParticles, spawnPopup, update };
})();

// обратная совместимость
function spawnParticles(x, y, color)              { Particles.spawnParticles(x, y, color); }
function spawnPopup(x, y, text, color, imgSrc)    { Particles.spawnPopup(x, y, text, color, imgSrc); }
function updateParticles()                         { Particles.update(); }
function updatePopups()                            { Particles.update(); }
