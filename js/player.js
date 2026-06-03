// ИГРОК: СПРАЙТ-СИСТЕМА СО СКИНАМИ
//
// КАК ДОБАВИТЬ СКИН:
//   1. Положи PNG в img/
//   2. Добавь запись в SKINS
//   3. Активировать: activeSkin = 'id'
// общие параметры всех скинов — переопределять только при отличии
const SKIN_DEFAULTS = {
    defaultDir: 1,
    w:    44, h:    44,
    drawW: 50, drawH: 50,
    drawOX: -20, drawOY: -40,
};

function _skin(src, glow) {
    return { ...SKIN_DEFAULTS, src, glow };
}

const SKINS = {
    dood:         _skin('img/dood.png',         '#00FF83'),  // зелёный
    dood_blue:    _skin('img/dood_blue.png',    '#005FFF'),  // синий
    dood_red:     _skin('img/dood_red.png',     '#FF0031'),  // красный
    dood_gold:    _skin('img/dood_gold.png',    '#FFCA00'),  // золотой
    dood_diamond: _skin('img/dood_diamond.png', '#5FFFFF'),  // голубой
    dood_ruby:    _skin('img/dood_ruby.png',    '#FF005B'),  // рубиновый
    dood_robo:    _skin('img/dood_robo.png',    '#FB8800'),  // оранжевый
    dood_fashion: _skin('img/dood_fashion.png', '#FF00DD'),  // розовый
    dood_mafia:   _skin('img/dood_mafia.png',   '#9911FF'),  // фиолетовый
};

let activeSkin = (() => {
    try {
        const saved = localStorage.getItem('dj_skin');
        return (saved && SKINS[saved]) ? saved : 'dood';
    } catch (_) { return 'dood'; }
})();

// Спрайты скинов — загружены Preloader'ом до старта игры
const PlayerSprite = (() => {

    function get(id) {
        const def = SKINS[id];
        if (!def) return null;
        return (typeof Preloader !== 'undefined') ? Preloader.get(def.src) : null;
    }

    // обновляется один раз за тик в loop.js — не вычисляется внутри drawPlayer
    let glowPulse = 12;
    function updateGlow() {
        const t = performance.now() / 1000;
        glowPulse = 12 + Math.sin(t * Math.PI * 2 * 1.2) * 6;
    }

    return { get, updateGlow, get glowPulse() { return glowPulse; } };
})();

// Создание игрока
function makePlayer() {
    const skin = SKINS[activeSkin];
    return {
        x:      W / 2 - skin.w / 2,
        y:      H - 160,
        w:      skin.w,
        h:      skin.h,
        vx:     0,
        vy:     0,
        facing: 1,
        squish: 1,
    };
}

// Отрисовка игрока
function drawPlayer(p) {
    const skin = SKINS[activeSkin];
    const img  = PlayerSprite.get(activeSkin);

    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    const scaleX = p.facing * (skin.defaultDir || 1);
    ctx.scale(scaleX, p.squish);

    if (img) {
        // тень под игроком
        ctx.beginPath();
        ctx.ellipse(0, skin.h / 2 + 4, skin.w * 0.38, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();

        if (skin.glow) {
            ctx.shadowColor = skin.glow;
            ctx.shadowBlur  = PlayerSprite.glowPulse;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, skin.drawOX, skin.drawOY, skin.drawW, skin.drawH);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur  = 0;

    } else {
        // спрайт ещё грузится — показываем хитбокс-заглушку
        const hw = skin.w / 2, hh = skin.h / 2;
        ctx.strokeStyle = '#e84040';
        ctx.lineWidth   = 2;
        ctx.strokeRect(-hw, -hh, skin.w, skin.h);
        ctx.beginPath();
        ctx.moveTo(-hw, -hh); ctx.lineTo(hw, hh);
        ctx.moveTo( hw, -hh); ctx.lineTo(-hw, hh);
        ctx.stroke();
        ctx.fillStyle = '#e84040';
        ctx.font      = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('IMG?', 0, 4);
    }

    ctx.restore();
}
