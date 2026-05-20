// АЛМАЗЫ В ВОЗДУХЕ
// DIAMOND_CFG — единственное место для настройки алмазов.
//
// Картинка:
//   imgSrc: null        → рисуется встроенный геометрический алмаз
//   imgSrc: 'img/diamond.png' → твоя PNG (любой размер, подгоняется под size)
//
// Звук подбора:
//   collectSfx: 'diamond'  → ключ из AUDIO_CONFIG в audio.js
//   Добавить свой звук: положи mp3 в audio/, добавь запись в AUDIO_CONFIG,
//   и напиши имя ключа сюда.
const DIAMOND_CFG = {
    // Шанс попытки спавна при генерации каждой новой платформы (0.0 – 1.0)
    spawnChance: 0.02,      // 2% базовый шанс + бонус от пассива "Алмазная лихорадка"

    size:        18,        // радиус описанной окружины / половина стороны PNG

    imgSrc:      'img/diamond.png',  // null = встроенный рендер | 'img/diamond.png' = своя картинка

    collectSfx:  'diamond', // ключ звука из AUDIO_CONFIG

    // Радиус коллизии подбора (px от центра алмаза до центра игрока)
    pickupRadius: 30,

    // Иконка алмаза в UI (shop-balance, shop-ad-btn, shop-badge price, HUD).
    // Варианты:
    //   '💎'                              — emoji
    //   '<img src="img/diamond.png" style="width:16px;height:16px;vertical-align:middle">'  — своя картинка
    uiIcon: '<img src="img/diamond.png" style="width:24px;height:24px;vertical-align:middle">',
};

// Загрузчик картинки (ленивый, только если imgSrc задан)
const DiamondSprite = (() => {
    let _img   = null;
    let _ready = false;

    function load(src) {
        if (!src || _img) return;
        _img = new Image();
        _img.onload  = () => { _ready = true; };
        _img.onerror = () => { console.warn('[Diamond] Не удалось загрузить:', src); };
        _img.src = src;
    }

    function get() { return _ready ? _img : null; }

    return { load, get };
})();

if (DIAMOND_CFG.imgSrc) DiamondSprite.load(DIAMOND_CFG.imgSrc);

// Встроенный рендер алмаза
function _drawBuiltinDiamond(ctx, x, y, size, alpha) {
    const s = size;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);

    // Тень
    ctx.beginPath();
    ctx.ellipse(0, s + 3, s * 0.55, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();

    // Грани алмаза (классическая форма diamond)
    ctx.beginPath();
    ctx.moveTo(0,    -s);        // верхушка
    ctx.lineTo( s,   -s * 0.2);  // правый верх
    ctx.lineTo( s * 0.6, s);     // правый низ
    ctx.lineTo(-s * 0.6, s);     // левый низ
    ctx.lineTo(-s,   -s * 0.2);  // левый верх
    ctx.closePath();
    ctx.fillStyle   = '#5b8dee';
    ctx.fill();
    ctx.strokeStyle = '#3a5fc0';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Блик
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, -s * 0.85);
    ctx.lineTo( s * 0.25, -s * 0.45);
    ctx.lineTo( s * 0.05, -s * 0.85);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();

    ctx.restore();
}

// Состояние

function resetDiamonds() {
    diamonds = [];
}

// Спавн между двумя платформами
function spawnDiamondBetween(newPlat) {
    // Итоговый шанс = (базовый + пассивный бонус) × множитель активного буста
    const baseChance  = DIAMOND_CFG.spawnChance + Passives.getSpawnBonus();
    const totalChance = baseChance * Actives.getDiamondMultiplier();
    if (Math.random() > totalChance) return;

    // Находим ближайшую платформу ниже
    let below = null;
    for (const p of platforms) {
        if (p === newPlat) continue;
        if (p.y <= newPlat.y) continue; // выше или на том же уровне
        if (!below || p.y < below.y) below = p;
    }
    if (!below) return; // нет нижней платформы не спавним

    const gapTop    = newPlat.y + newPlat.h + 8;  // нижний край верхней платформы + отступ
    const gapBottom = below.y - 8;                 // верхний край нижней платформы - отступ
    const minGap    = DIAMOND_CFG.size * 2 + 10;

    if (gapBottom - gapTop < minGap) return; // зазор слишком мал

    const spawnY = gapTop + (gapBottom - gapTop) * 0.5; // строго в середине зазора
    const spawnX = DIAMOND_CFG.size + Math.random() * (W - DIAMOND_CFG.size * 2);

    diamonds.push({
        x:          spawnX,
        y:          spawnY,
        collected:  false,
        alpha:      1,
        bobOffset:  Math.random() * Math.PI * 2, // фаза покачивания у каждого своя
    });
}

// Обновление + коллизия с игроком
function updateDiamonds() {
    const px    = player.x + player.w / 2;
    const py    = player.y + player.h / 2;
    const frame = _tickTime;

    for (let i = diamonds.length - 1; i >= 0; i--) {
        if (diamonds[i].alpha <= 0) { diamonds.splice(i, 1); }
    }

    for (const d of diamonds) {
        if (d.collected) {
            // Плавное исчезновение после подбора
            d.alpha = Math.max(0, d.alpha - 0.07);
            continue;
        }

        // Коллизия круговая, по центрам
        const dx   = px - d.x;
        const dy   = py - (d.y + Math.sin(frame * 2 + d.bobOffset) * 3); // учитываем бобб
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= DIAMOND_CFG.pickupRadius) {
            d.collected = true;
            // Шанс x2 от пассивного навыка doubleDiamond
            // Шанс x2: пассивный шанс × множитель активного буста
            const doubleChance = Passives.getDoubleChance() * Actives.getDoubleMultiplier();
            const isDouble = Math.random() < doubleChance;
            const reward   = isDouble ? 2 : 1;
            Currency.add(reward);
            Audio.playSfx(DIAMOND_CFG.collectSfx);
            spawnParticles(d.x, d.y, '#5b8dee');
            const popupImg  = DiamondSprite.get();
            const popupText = isDouble ? '+2' : '+1';
            spawnPopup(d.x, d.y - 14, popupText, isDouble ? '#f5a623' : '#3a6bd4', popupImg);
        }
    }
}

// Отрисовка
function drawDiamonds() {
    const frame = _tickTime;
    const img   = DiamondSprite.get();

    for (const d of diamonds) {
        if (d.alpha <= 0) continue;

        // Лёгкое покачивание по Y
        const bobY = Math.sin(frame * 2 + d.bobOffset) * 3;

        if (img) {
            const half = DIAMOND_CFG.size;
            ctx.save();
            ctx.globalAlpha = d.alpha;
            ctx.drawImage(img, d.x - half, d.y + bobY - half, half * 2, half * 2);
            ctx.restore();
        } else {
            _drawBuiltinDiamond(ctx, d.x, d.y + bobY, DIAMOND_CFG.size, d.alpha);
        }
    }
}
