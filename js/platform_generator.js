// генератор платформ
//
// баланс сложности — плавные фазы через интерполяцию:
//   0–150:   разгон
//   150–300: плавный ввод
//   300–900: средняя сложность
//   900–1800: жёсткий режим
//   1800–3600: хард
//   3600+: максимум

const PLATFORM_BALANCE = [
    { at:    0, normal: 0.85, oneshot: 0.15, moving: 0.00, fragile: 0.00 },
    { at:  150, normal: 0.70, oneshot: 0.20, moving: 0.10, fragile: 0.05 },
    { at:  300, normal: 0.55, oneshot: 0.20, moving: 0.15, fragile: 0.10 },
    { at:  900, normal: 0.40, oneshot: 0.17, moving: 0.20, fragile: 0.15 },
    { at: 1800, normal: 0.25, oneshot: 0.12, moving: 0.23, fragile: 0.30 },
    { at: 3600, normal: 0.15, oneshot: 0.15, moving: 0.25, fragile: 0.40 },
];

const MOVING_CFG = {
    MIN_SPD:           1.0,
    MAX_SPD:           3.0,
    REVERSE_THRESHOLD: 900,
    REVERSE_CHANCE:    0.35,
    REVERSE_INTERVAL:  [60, 180],
};

function _interpolateWeights(score) {
    const pts = PLATFORM_BALANCE;
    if (score <= pts[0].at) return { ...pts[0] };
    if (score >= pts[pts.length - 1].at) return { ...pts[pts.length - 1] };
    let lo = pts[0], hi = pts[1];
    for (let i = 1; i < pts.length - 1; i++) {
        if (score >= pts[i].at) { lo = pts[i]; hi = pts[i + 1]; }
    }
    const t = (score - lo.at) / (hi.at - lo.at);
    return {
        normal:  lo.normal  + (hi.normal  - lo.normal)  * t,
        oneshot: lo.oneshot + (hi.oneshot - lo.oneshot) * t,
        moving:  lo.moving  + (hi.moving  - lo.moving)  * t,
        fragile: lo.fragile + (hi.fragile - lo.fragile) * t,
    };
}

let lastGenType = 'normal';

function pickType(score) {
    const w = _interpolateWeights(score);
    const r = Math.random();
    let type;
    if      (r < w.normal)                         type = 'normal';
    else if (r < w.normal + w.oneshot)             type = 'oneshot';
    else if (r < w.normal + w.oneshot + w.moving)  type = 'moving';
    else                                           type = 'fragile';

    if (type === 'fragile' && lastGenType === 'fragile') {
        type = Math.random() < 0.6 ? 'normal' : 'moving';
    }
    if (type === 'moving' && lastGenType === 'moving') {
        type = Math.random() < 0.6 ? 'oneshot' : 'normal';
    }
    lastGenType = type;
    return type;
}

function _applyMovingBehavior(p, score) {
    const cfg   = MOVING_CFG;
    p.moveSpd   = cfg.MIN_SPD + Math.random() * (cfg.MAX_SPD - cfg.MIN_SPD);
    p.moveDir   = Math.random() < 0.5 ? 1 : -1;
    p.moveLeft  = 10;
    p.moveRight = W - p.w - 10;
    if (score >= cfg.REVERSE_THRESHOLD && Math.random() < cfg.REVERSE_CHANCE) {
        const [min, max]  = cfg.REVERSE_INTERVAL;
        p.reverseMode     = true;
        p.reverseTimer    = 0;
        p.reverseInterval = Math.floor(min + Math.random() * (max - min));
    } else {
        p.reverseMode = false;
    }
}

// единственная точка создания платформ в игре
// объединяет makePlatform (чистая фабрика) + moving-поведение
function makeGamePlatform(x, y, type, score = 0) {
    const p = makePlatform(x, y, type);
    if (type === 'moving') _applyMovingBehavior(p, score);
    return p;
}

let _topPlatY = 0;

function spawnInitialPlatforms() {
    GameState.platforms = [];
    lastGenType = 'normal';
    GameState.platforms.push(makeGamePlatform(W / 2 - 31, H - 80, 'normal', 0));
    let py = H - 80;
    for (let i = 0; i < 18; i++) {
        py -= 70 + Math.random() * 55;
        GameState.platforms.push(makeGamePlatform(Math.random() * (W - 70), py, pickType(0), 0));
    }
    _topPlatY = py;
}

function generateMore() {
    if (_topPlatY - cameraY > -H * 0.5) {
        const ny      = _topPlatY - (65 + Math.random() * 65);
        const nx      = Math.random() * (W - 70);
        const newPlat = makeGamePlatform(nx, ny, pickType(GameState.score), GameState.score);
        GameState.platforms.push(newPlat);
        _topPlatY = ny;
        spawnDiamondBetween(newPlat);
    }

    for (let i = GameState.platforms.length - 1; i >= 0; i--) {
        const p = GameState.platforms[i];
        if (p.y - cameraY >= H + 160 || p.alpha <= 0) {
            GameState.platforms.splice(i, 1);
        }
    }
}
