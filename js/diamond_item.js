// алмазы в воздухе

const DIAMOND_CFG = {
    spawnChance:  0.02,
    size:         18,
    imgSrc:       'img/diamond.png',
    collectSfx:   'diamond',
    pickupRadius: 30,
    uiIcon:       '<img src="img/diamond.png" style="width:24px;height:24px;vertical-align:middle">',
};

const DiamondSprite = (() => {
    // изображение гарантированно загружено Preloader'ом до старта игры
    function get() {
        return (typeof Preloader !== 'undefined') ? Preloader.get(DIAMOND_CFG.imgSrc) : null;
    }
    return { get };
})();

function _drawBuiltinDiamond(ctx, x, y, size, alpha) {
    const s = size;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.ellipse(0, s + 3, s * 0.55, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0,       -s);
    ctx.lineTo( s,      -s * 0.2);
    ctx.lineTo( s * 0.6, s);
    ctx.lineTo(-s * 0.6, s);
    ctx.lineTo(-s,      -s * 0.2);
    ctx.closePath();
    ctx.fillStyle   = '#5b8dee';
    ctx.fill();
    ctx.strokeStyle = '#3a5fc0';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, -s * 0.85);
    ctx.lineTo( s * 0.25, -s * 0.45);
    ctx.lineTo( s * 0.05, -s * 0.85);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
    ctx.restore();
}

const Diamonds = (() => {

    function reset() {
        GameState.diamonds = [];
    }

    function spawnBetween(newPlat) {
        const baseChance  = DIAMOND_CFG.spawnChance + Passives.getSpawnBonus();
        const totalChance = baseChance * Actives.getDiamondMultiplier();
        if (Math.random() > totalChance) return;

        let below = null;
        for (const p of GameState.platforms) {
            if (p === newPlat) continue;
            if (p.y <= newPlat.y) continue;
            if (!below || p.y < below.y) below = p;
        }
        if (!below) return;

        const gapTop    = newPlat.y + newPlat.h + 8;
        const gapBottom = below.y - 8;
        const minGap    = DIAMOND_CFG.size * 2 + 10;
        if (gapBottom - gapTop < minGap) return;

        const spawnY = gapTop + (gapBottom - gapTop) * 0.5;
        const spawnX = DIAMOND_CFG.size + Math.random() * (W - DIAMOND_CFG.size * 2);

        GameState.diamonds.push({
            x:         spawnX,
            y:         spawnY,
            collected: false,
            alpha:     1,
            bobOffset: Math.random() * Math.PI * 2,
        });
    }

    function update(tickTime) {
        const { player, diamonds } = GameState;
        const px = player.x + player.w / 2;
        const py = player.y + player.h / 2;

        for (let i = diamonds.length - 1; i >= 0; i--) {
            if (diamonds[i].alpha <= 0) { diamonds.splice(i, 1); }
        }

        for (const d of diamonds) {
            if (d.collected) {
                d.alpha = Math.max(0, d.alpha - 0.07);
                continue;
            }

            const bobY = Math.sin(tickTime * 2 + d.bobOffset) * 3;
            const dx   = px - d.x;
            const dy   = py - (d.y + bobY);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= DIAMOND_CFG.pickupRadius) {
                d.collected = true;
                const doubleChance = Passives.getDoubleChance() * Actives.getDoubleMultiplier();
                const isDouble     = Math.random() < doubleChance;
                const skinBonus    = activeSkin === 'dood_robo'    ? 1
                                   : activeSkin === 'dood_fashion' ? 3
                                   : activeSkin === 'dood_mafia'   ? 5 : 0;
                const amount       = (1 + skinBonus) * (isDouble ? 2 : 1);
                Currency.add(amount);
                Audio.playSfx(DIAMOND_CFG.collectSfx);
                Particles.spawnParticles(d.x, d.y, '#5b8dee');
                Particles.spawnPopup(
                    d.x, d.y - 14,
                    `+${amount}`,
                    isDouble ? '#f5a623' : '#3a6bd4',
                    DIAMOND_CFG.imgSrc
                );
            }
        }
    }

    function draw(tickTime) {
        const { diamonds } = GameState;
        const img = DiamondSprite.get();

        for (const d of diamonds) {
            if (d.alpha <= 0) continue;
            const bobY = Math.sin(tickTime * 2 + d.bobOffset) * 3;
            if (!img) continue; // спрайт ещё грузится — не рисуем геометрию
            const half = DIAMOND_CFG.size;
            ctx.save();
            ctx.globalAlpha = d.alpha;
            ctx.drawImage(img, d.x - half, d.y + bobY - half, half * 2, half * 2);
            ctx.restore();
        }
    }

    return { reset, spawnBetween, update, draw };
})();

