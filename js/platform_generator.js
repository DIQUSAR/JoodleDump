// ГЕНЕРАТОР ПЛАТФОРМ
//
// Баланс сложности — плавные фазы через интерполяцию:
//   0–150:   разгон
//   150–300: плавный ввод
//   300–900: средняя сложность
//   900–1800: жёсткий режим
//   1800-3600: хард
//   3600+: удаляй
// Движущиеся платформы (moving):
//   - Скорость: случайная в диапазоне [MIN_SPD, MAX_SPD], не одинаковая
//   - При высоком счёте (>= REVERSE_THRESHOLD) с вероятностью REVERSE_CHANCE
//     платформа «неожиданно» меняет направление раз в REVERSE_INTERVAL кадров

const PLATFORM_BALANCE = [
    // { at: score, normal, oneshot, moving, fragile }  — сумма = 1.0
    { at:    0, normal: 0.85, oneshot: 0.15, moving: 0.00, fragile: 0.00 },
    { at:  150, normal: 0.70, oneshot: 0.20, moving: 0.10, fragile: 0.05 },
    { at:  300, normal: 0.55, oneshot: 0.20, moving: 0.15, fragile: 0.10 },
    { at:  900, normal: 0.40, oneshot: 0.17, moving: 0.20, fragile: 0.15 },
    { at: 1800, normal: 0.25, oneshot: 0.12, moving: 0.23, fragile: 0.30 },
    { at: 3600, normal: 0.15, oneshot: 0.15, moving: 0.25, fragile: 0.40 },
];

// Настройки движущихся платформ
const MOVING_CFG = {
    MIN_SPD:           1.0,   // минимальная скорость
    MAX_SPD:           3.0,   // максимальная скорость
    REVERSE_THRESHOLD: 900,   // счёт с которого начинаются неожиданные развороты
    REVERSE_CHANCE:    0.35,  // вероятность что платформа имеет «режим разворота»
    REVERSE_INTERVAL:  [60, 180], // [min, max] кадров между разворотами
};

// Интерполяция вероятностей между двумя ближайшими точками баланса
function _interpolateWeights(score) {
    const pts = PLATFORM_BALANCE;
    if (score <= pts[0].at) return { ...pts[0] };
    if (score >= pts[pts.length - 1].at) return { ...pts[pts.length - 1] };

    let lo = pts[0], hi = pts[1];
    for (let i = 1; i < pts.length - 1; i++) {
        if (score >= pts[i].at) { lo = pts[i]; hi = pts[i + 1]; }
    }

    const t = (score - lo.at) / (hi.at - lo.at); // 0..1
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

    // Не ставим одинаковые «сложные» типы подряд
    if (type === 'fragile' && lastGenType === 'fragile') {
        type = Math.random() < 0.6 ? 'normal' : 'moving';
    }
    if (type === 'moving' && lastGenType === 'moving') {
        type = Math.random() < 0.6 ? 'oneshot' : 'normal';
    }

    lastGenType = type;
    return type;
}

// Создаёт moving-платформу с уникальной скоростью и опциональным режимом разворота
function _applyMovingBehavior(p, score) {
    const cfg = MOVING_CFG;

    // Случайная скорость в диапазоне каждая платформа двигается по-своему
    p.moveSpd = cfg.MIN_SPD + Math.random() * (cfg.MAX_SPD - cfg.MIN_SPD);
    p.moveDir = Math.random() < 0.5 ? 1 : -1;
    p.moveLeft  = 10;
    p.moveRight = W - p.w - 10;

    // Неожиданные развороты при высоком счёте
    if (score >= cfg.REVERSE_THRESHOLD && Math.random() < cfg.REVERSE_CHANCE) {
        const [min, max] = cfg.REVERSE_INTERVAL;
        p.reverseMode     = true;
        p.reverseTimer    = 0;
        p.reverseInterval = Math.floor(min + Math.random() * (max - min));
    } else {
        p.reverseMode = false;
    }
}

// Патч makePlatform перехватываем создание moving-платформ
const _origMakePlatform = makePlatform;

makePlatform = function(x, y, type) {
    const p = _origMakePlatform(x, y, type);
    if (type === 'moving') _applyMovingBehavior(p, typeof score !== 'undefined' ? score : 0);
    return p;
};

function spawnInitialPlatforms() {
    platforms = [];
    lastGenType = 'normal';
    platforms.push(makePlatform(W / 2 - 31, H - 80, 'normal'));
    let py = H - 80;
    for (let i = 0; i < 18; i++) {
        py -= 70 + Math.random() * 55;
        platforms.push(makePlatform(Math.random() * (W - 70), py, pickType(0)));
    }
    _topPlatY = py;
}

// Верхняя граница платформ — обновляется при добавлении, не пересчитывается каждый кадр
let _topPlatY = 0;

function generateMore() {
    if (_topPlatY - cameraY > -H * 0.5) {
        const ny = _topPlatY - (65 + Math.random() * 65);
        const nx = Math.random() * (W - 70);
        const newPlat = makePlatform(nx, ny, pickType(score));
        platforms.push(newPlat);
        _topPlatY = ny;
        spawnDiamondBetween(newPlat);
    }

    // Удаляем платформы ушедшие за нижний край экрана или полностью прозрачные
    for (let i = platforms.length - 1; i >= 0; i--) {
        const p = platforms[i];
        if (p.y - cameraY >= H + 160 || p.alpha <= 0) { platforms.splice(i, 1); }
    }
}
