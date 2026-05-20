// ЧАСТИЦЫ И ВСПЛЫВАЮЩИЕ НАДПИСИ
function spawnParticles(x, y, color) {
    for (let i = 0; i < 7; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 5,
            vy: -Math.random() * 4 - 1,
            life: 1,
            color
        });
    }
}

// img — готовый HTMLImageElement из кэша (DiamondSprite.get()),
// передавать src-строку нельзя — это создаёт new Image() в игровом цикле.
function spawnPopup(x, y, text, color, img) {
    popups.push({
        x,
        screenY: y - cameraY,
        text,
        color,
        life:     1,
        img:      img || null,
        imgReady: img instanceof HTMLImageElement && img.complete,
    });
}

function updateParticles() {
    // обновляем и рисуем за один проход, затем удаляем мёртвые swap-delete
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.18;
        p.life -= 0.05;
        if (p.life <= 0) {
            particles[i] = particles[particles.length - 1];
            particles.pop();
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

function updatePopups() {
    for (let i = popups.length - 1; i >= 0; i--) {
        if (popups[i].life <= 0) { popups.splice(i, 1); }
    }
    for (const p of popups) {
        p.screenY -= 1.4;   // поднимается вверх по экрану
        p.life    -= 0.025; // плавнее исчезает (было 0.022 — почти то же)

        if (p.life <= 0) continue;

        ctx.save();
        // Плавное появление в начале (первые 20% жизни)
        const fadeIn  = Math.min(1, (1 - p.life) * 5);
        // Плавное исчезновение в конце (последние 40% жизни)
        const fadeOut = p.life < 0.4 ? p.life / 0.4 : 1;
        ctx.globalAlpha = Math.min(fadeIn, fadeOut);
        // Масштаб чуть увеличивается при появлении
        const scale = 0.7 + 0.3 * fadeIn;
        ctx.translate(p.x, p.screenY);
        ctx.scale(scale, scale);
        if (p.imgReady && p.img) {
            // Рисуем картинку вместо текста
            const size = 22 * scale;
            ctx.drawImage(p.img, -size / 2, -size / 2, size, size);
            // Подпись +1 рядом
            ctx.font         = 'bold 13px Patrick Hand, cursive';
            ctx.textAlign    = 'left';
            ctx.textBaseline = 'middle';
            ctx.lineWidth    = 3;
            ctx.strokeStyle  = 'rgba(255,255,255,0.85)';
            ctx.strokeText('+1', size / 2 + 2, 0);
            ctx.fillStyle    = p.color;
            ctx.fillText('+1', size / 2 + 2, 0);
        } else {
            // Обычный текст
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
