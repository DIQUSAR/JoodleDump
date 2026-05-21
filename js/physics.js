// физика и логика обновления

function applyInput() {
    applyGyroToKeys();

    let ax = 0;
    if (GameState.keys.left)  ax = -PLAYER_SPD;
    if (GameState.keys.right) ax =  PLAYER_SPD;

    const player = GameState.player;
    player.vx = ax;
    if (ax !== 0) player.facing = ax > 0 ? 1 : -1;
}

function integratePhysics() {
    const player = GameState.player;
    player.vy += GRAVITY;
    player.x  += player.vx;
    player.y  += player.vy;

    if (player.x > W)            player.x = -player.w;
    if (player.x + player.w < 0) player.x = W;
}

function updateSquish() {
    const player = GameState.player;
    const vy = player.vy;
    const squishTarget = vy < -6 ? 0.82 : (vy > 2 ? 1.06 : 1.0);
    player.squish += (squishTarget - player.squish) * 0.18;
    if (player.squish > 1.10) player.squish = 1.10;
    if (player.squish < 0.70) player.squish = 0.70;
}

function resolveCollisions() {
    const player = GameState.player;
    if (player.vy <= 0) return;

    const foot         = player.y + player.h;
    const pxL          = player.x + 4;
    const pxR          = player.x + player.w - 4;
    const sjChanceBase = Passives.getSuperJumpChance();

    for (let i = 0; i < GameState.platforms.length; i++) {
        const p = GameState.platforms[i];
        if (p.alpha <= 0 || p.breaking) continue;

        const screenY = p.y - GameState.cameraY;
        if (screenY > H || screenY < -p.h - 20) continue;
        if (pxR <= p.x + 4 || pxL >= p.x + p.w - 4) continue;
        if (foot < p.y || foot > p.y + p.h + player.vy + 2) continue;

        _handlePlatformContact(player, p, sjChanceBase);
        break;
    }
}

function _handlePlatformContact(player, p, sjChanceBase) {
    if (p.type === 'fragile') {
        p.breaking = true;
        spawnParticles(p.x + 31, p.y, '#e84040');
        spawnPopup(p.x + 31, p.y - 14, I18n.t('popupOops'), '#c62828');
        return;
    }

    if (p.type === 'oneshot') {
        if (p.used) return;
        p.used = true;
    }

    const sjChance    = sjChanceBase * Actives.getSuperJumpMultiplier();
    const isSuperJump = Math.random() < sjChance;
    player.vy     = isSuperJump ? JUMP_V * 1.5 : JUMP_V;
    player.squish = isSuperJump ? 0.6 : 0.72;
    Audio.playSfx('jump');

    if (isSuperJump) {
        spawnParticles(p.x + 31, p.y, '#7c4dff');
        spawnPopup(p.x + 31, p.y - 14, I18n.t('popupSuperJump'), '#512da8');
    } else if (p.type === 'oneshot') {
        spawnParticles(p.x + 31, p.y, '#ffcc02');
        spawnPopup(p.x + 31, p.y - 14, I18n.t('popupLast'), '#e65100');
    }
}

function updatePlatforms() {
    for (let i = 0; i < GameState.platforms.length; i++) {
        const p = GameState.platforms[i];

        if (p.breaking) {
            p.breakTimer++;
            p.alpha = p.breakTimer >= 12 ? 0 : 1 - p.breakTimer / 12;
            continue;
        }

        if (p.type === 'oneshot' && p.used) {
            p.alpha -= 0.035;
            if (p.alpha < 0) p.alpha = 0;
            continue;
        }

        if (p.type === 'moving') {
            _updateMovingPlatform(p);
        }
    }
}

function _updateMovingPlatform(p) {
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

function updateCamera() {
    const player      = GameState.player;
    const screenPlayerY = player.y - GameState.cameraY;
    if (screenPlayerY >= H * 0.38) return;

    GameState.cameraY -= (H * 0.38 - screenPlayerY);

    const newScore = Math.max(GameState.score, (-GameState.cameraY / 10) | 0);
    if (newScore !== GameState.score) {
        GameState.score = newScore;
        HUD.setScore(newScore);
    }
    if (newScore > GameState.highScore) {
        GameState.highScore = newScore;
        HUD.setHigh(newScore);
    }
}

function checkDeath() {
    if (GameState.player.y - GameState.cameraY > H + 80) {
        setPhase('dead');
        showGameOver();
    }
}

function update() {
    applyInput();
    integratePhysics();
    updateSquish();
    resolveCollisions();
    updatePlatforms();
    updateCamera();
    generateMore();
    checkDeath();
}
