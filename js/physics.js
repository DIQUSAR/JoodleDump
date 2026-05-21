// физика и логика обновления
function update() {

    applyGyroToKeys();

    // горизонтальное движение
    let ax = 0;
    if (keys.left)  ax = -PLAYER_SPD;
    if (keys.right) ax =  PLAYER_SPD;
    player.vx = ax;
    if (ax !== 0) player.facing = ax > 0 ? 1 : -1;

    // гравитация и позиция
    player.vy += GRAVITY;
    player.x  += player.vx;
    player.y  += player.vy;

    // горизонтальный wraparound
    if (player.x > W)            player.x = -player.w;
    if (player.x + player.w < 0) player.x = W;

    // squish (анимация сжатия)
    const vy = player.vy;
    const squishTarget = vy < -6 ? 0.82 : (vy > 2 ? 1.06 : 1.0);
    player.squish += (squishTarget - player.squish) * 0.18;
    if (player.squish > 1.10) player.squish = 1.10;
    if (player.squish < 0.70) player.squish = 0.70;

    // коллизии с платформами (только при падении вниз)
    if (vy > 0) {
        const foot  = player.y + player.h;
        const pxL   = player.x + 4;
        const pxR   = player.x + player.w - 4;
        const sjChanceBase = Passives.getSuperJumpChance();

        for (let i = 0; i < platforms.length; i++) {
            const p = platforms[i];
            if (p.alpha <= 0 || p.breaking) continue;

            const screenY = p.y - cameraY;
            if (screenY > H || screenY < -p.h - 20) continue;

            if (pxR <= p.x + 4 || pxL >= p.x + p.w - 4) continue;
            if (foot < p.y || foot > p.y + p.h + vy + 2) continue;

            if (p.type === 'fragile') {
                p.breaking = true;
                spawnParticles(p.x + 31, p.y, '#e84040');
                spawnPopup(p.x + 31, p.y - 14, I18n.t('popupOops'), '#c62828');

            } else if (p.type === 'oneshot') {
                if (!p.used) {
                    const sjChance    = sjChanceBase * Actives.getSuperJumpMultiplier();
                    const isSuperJump = Math.random() < sjChance;
                    player.vy     = isSuperJump ? JUMP_V * 1.5 : JUMP_V;
                    player.squish = isSuperJump ? 0.6 : 0.72;
                    p.used = true;
                    Audio.playSfx('jump');
                    spawnParticles(p.x + 31, p.y, isSuperJump ? '#7c4dff' : '#ffcc02');
                    spawnPopup(p.x + 31, p.y - 14,
                        isSuperJump ? I18n.t('popupSuperJump') : I18n.t('popupLast'),
                        isSuperJump ? '#512da8' : '#e65100');
                }
            } else {
                const sjChance    = sjChanceBase * Actives.getSuperJumpMultiplier();
                const isSuperJump = Math.random() < sjChance;
                player.vy     = isSuperJump ? JUMP_V * 1.5 : JUMP_V;
                player.squish = isSuperJump ? 0.6 : 0.72;
                Audio.playSfx('jump');
                if (isSuperJump) {
                    spawnParticles(p.x + 31, p.y, '#7c4dff');
                    spawnPopup(p.x + 31, p.y - 14, I18n.t('popupSuperJump'), '#512da8');
                }
            }
            break;
        }
    }

    // анимация и движение платформ
    for (let i = 0; i < platforms.length; i++) {
        const p = platforms[i];
        if (p.breaking) {
            p.breakTimer++;
            p.alpha = p.breakTimer >= 12 ? 0 : 1 - p.breakTimer / 12;
        }
        if (p.type === 'oneshot' && p.used && !p.breaking) {
            p.alpha -= 0.035;
            if (p.alpha < 0) p.alpha = 0;
        }
        if (p.type === 'moving' && !p.breaking) {
            if (p.reverseMode) {
                p.reverseTimer++;
                if (p.reverseTimer >= p.reverseInterval) {
                    p.moveDir *= -1;
                    p.reverseTimer = 0;
                    const [min, max] = MOVING_CFG.REVERSE_INTERVAL;
                    p.reverseInterval = (min + Math.random() * (max - min)) | 0;
                }
            }
            p.x += p.moveDir * p.moveSpd;
            if (p.x <= p.moveLeft)  { p.x = p.moveLeft;  p.moveDir =  1; }
            if (p.x >= p.moveRight) { p.x = p.moveRight; p.moveDir = -1; }
        }
    }

    // камера
    const screenPlayerY = player.y - cameraY;
    if (screenPlayerY < H * 0.38) {
        GameState.cameraY -= (H * 0.38 - screenPlayerY);
        const newScore = Math.max(score, (-cameraY / 10) | 0);
        if (newScore !== GameState.score) {
            GameState.score = newScore;
            HUD.setScore(newScore);
        }
        if (newScore > GameState.highScore) {
            GameState.highScore = newScore;
            HUD.setHigh(newScore);
        }
    }

    generateMore();

    // смерть
    if (player.y - cameraY > H + 80) {
        setPhase('dead');
        showGameOver();
    }
}
