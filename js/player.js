// ИГРОК: СПРАЙТ-СИСТЕМА СО СКИНАМИ
//
// КАК ДОБАВИТЬ СКИН:
//   1. Положи PNG в img/
//   2. Добавь запись в SKINS
//   3. Активировать: activeSkin = 'id'
const SKINS = {
    dood: {
        src:        'img/dood.png',
        defaultDir: 1,
        w:          44,
        h:          44,
        drawW:      50,
        drawH:      50,
        drawOX:     -20,
        drawOY:     -40,
        glow:       '#00FF83',  // зелёный
    },
    dood_blue: {
        src:        'img/dood_blue.png',
        defaultDir: 1,
        w:          44,
        h:          44,
        drawW:      50,
        drawH:      50,
        drawOX:     -20,
        drawOY:     -40,
        glow:       '#005FFF',  // синий
    },
    dood_red: {
        src:        'img/dood_red.png',
        defaultDir: 1,
        w:          44,
        h:          44,
        drawW:      50,
        drawH:      50,
        drawOX:     -20,
        drawOY:     -40,
        glow:       '#FF0031',  // красный
    },
    dood_gold: {
        src:        'img/dood_gold.png',
        defaultDir: 1,
        w:          44,
        h:          44,
        drawW:      50,
        drawH:      50,
        drawOX:     -20,
        drawOY:     -40,
        glow:       '#FFCA00',  // золотой
    },
    dood_diamond: {
        src:        'img/dood_diamond.png',
        defaultDir: 1,
        w:          44,
        h:          44,
        drawW:      50,
        drawH:      50,
        drawOX:     -20,
        drawOY:     -40,
        glow:       '#5FFFFF',  // голубой
    },
    dood_ruby: {
        src:        'img/dood_ruby.png',
        defaultDir: 1,
        w:          44,
        h:          44,
        drawW:      50,
        drawH:      50,
        drawOX:     -20,
        drawOY:     -40,
        glow:       '#FF005B',  // рубиновый
    },
    dood_robo: {
        src:        'img/dood_robo.png',
        defaultDir: 1,
        w:          44,
        h:          44,
        drawW:      50,
        drawH:      50,
        drawOX:     -20,
        drawOY:     -40,
        glow:       '#FB8800',  // оранжевый
    },
    dood_fashion: {
        src:        'img/dood_fashion.png',
        defaultDir: 1,
        w:          44,
        h:          44,
        drawW:      50,
        drawH:      50,
        drawOX:     -20,
        drawOY:     -40,
        glow:       '#FF00DD',  // розовый
    },
    dood_mafia: {
        src:        'img/dood_mafia.png',
        defaultDir: 1,
        w:          44,
        h:          44,
        drawW:      50,
        drawH:      50,
        drawOX:     -20,
        drawOY:     -40,
        glow:       '#9911FF',  // фиолетовый
    },
};

let activeSkin = (() => {
    try {
        const saved = localStorage.getItem('dj_skin');
        return (saved && SKINS[saved]) ? saved : 'dood';
    } catch (_) { return 'dood'; }
})();

// Загрузчик спрайтов
const PlayerSprite = (() => {
    const _imgs  = {};
    const _ready = {};

    function load(id) {
        const def = SKINS[id];
        if (!def || !def.src || _imgs[id]) return;

        const img  = new Image();
        _ready[id] = false;
        _imgs[id]  = img;

        img.onload  = () => { _ready[id] = true; };
        img.onerror = () => { console.warn('[Skin] Не удалось загрузить:', def.src); };
        img.src = def.src;
    }

    function get(id) {
        return _ready[id] ? _imgs[id] : null;
    }

    // Обновляется один раз за тик в loop.js — не вычисляется внутри drawPlayer
    let glowPulse = 12;
    function updateGlow() {
        const t = performance.now() / 1000;
        glowPulse = 12 + Math.sin(t * Math.PI * 2 * 1.2) * 6;
    }

    return { load, get, updateGlow, get glowPulse() { return glowPulse; } };
})();

// загружаем активный скин первым — нужен для первого кадра
PlayerSprite.load(activeSkin);

// остальные скины стартуют сразу следом — браузер сам расставит приоритеты,
// Image() загрузка не блокирует рендер и не мешает AudioContext
function preloadInactiveSkins() {
    Object.keys(SKINS).forEach(id => {
        if (id !== activeSkin) PlayerSprite.load(id);
    });
}
preloadInactiveSkins();

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
        // Тень под игроком
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

        // Сбрасываем shadow чтобы не влиять на другие элементы
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur  = 0;

    } else {
        // Спрайт ещё грузится — показываем хитбокс-заглушку
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
