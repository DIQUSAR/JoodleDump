// платформы: фабрика + отрисовка через OffscreenCanvas-кеш
// каждый тип кешируется один раз, потом только drawImage

const PLAT_COLORS = {
    normal:  { fill: '#5cb85c', stroke: '#3a7a34' },
    oneshot: { fill: '#f0a030', stroke: '#b05510' },
    fragile: { fill: '#e84040', stroke: '#901010' },
    moving:  { fill: '#2196f3', stroke: '#0d47a1' },
};

const PLAT_W = 62;
const PLAT_H = 12;

// дополнительный отступ вокруг пути — предотвращает обрезку stroke по краям canvas
const _PLAT_PAD = 1;

function makePlatform(x, y, type) {
    return { x, y, w: PLAT_W, h: PLAT_H, type, used: false, alpha: 1, breaking: false, breakTimer: 0 };
}

const _platCache = {};

function _buildPlatSprite(type) {
    const c  = PLAT_COLORS[type] || PLAT_COLORS.normal;
    const pw = PLAT_W + _PLAT_PAD * 2;
    const ph = PLAT_H + _PLAT_PAD * 2;
    const oc = createOffscreen(pw, ph);
    const ot = oc.getContext('2d');
    const r  = 5;
    const x0 = _PLAT_PAD;
    const y0 = _PLAT_PAD;
    const w  = PLAT_W;
    const h  = PLAT_H;

    ot.beginPath();
    ot.moveTo(x0 + r, y0);
    ot.lineTo(x0 + w - r, y0);
    ot.arcTo(x0 + w, y0,     x0 + w, y0 + r,     r);
    ot.lineTo(x0 + w, y0 + h - r);
    ot.arcTo(x0 + w, y0 + h, x0 + w - r, y0 + h, r);
    ot.lineTo(x0 + r, y0 + h);
    ot.arcTo(x0,      y0 + h, x0, y0 + h - r,     r);
    ot.lineTo(x0,     y0 + r);
    ot.arcTo(x0,      y0,     x0 + r, y0,          r);
    ot.closePath();
    ot.fillStyle   = c.fill;
    ot.fill();
    ot.strokeStyle = c.stroke;
    ot.lineWidth   = 2;
    ot.stroke();

    // декоративный зигзаг поверх
    ot.strokeStyle = c.stroke;
    ot.lineWidth   = 1;
    ot.beginPath();
    let first = true;
    for (let i = 0; i < w - 10; i += 7) {
        const rx = x0 + 5 + i;
        const ry = y0 + 3.5 + (Math.floor(i / 7) % 2 === 0 ? -1 : 1);
        if (first) { ot.moveTo(rx, ry); first = false; } else ot.lineTo(rx, ry);
    }
    ot.stroke();

    return oc;
}

function _getPlatSprite(type) {
    if (!_platCache[type]) _platCache[type] = _buildPlatSprite(type);
    return _platCache[type];
}

function invalidatePlatCache() {
    for (const key of Object.keys(_platCache)) delete _platCache[key];
}

function drawPlatform(p) {
    if (p.alpha <= 0) return;
    const sprite = _getPlatSprite(p.type);
    const dx = p.x - _PLAT_PAD;
    const dy = p.y - _PLAT_PAD;
    if (p.alpha < 1) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(sprite, dx, dy);
        ctx.restore();
    } else {
        ctx.drawImage(sprite, dx, dy);
    }
}
