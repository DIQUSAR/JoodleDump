// background renderer for menu and gameplay
// menu: background.png (light) / background_dark.png (dark)
// gameplay: solid fill + notebook grid lines drawn into OffscreenCanvas tile,
//           then tiled via drawImage — replaces ~50 canvas calls with 1 per frame

const BG_LIGHT = {
    fill:      '#f8f8f2',
    lineV:     'rgba(180, 200, 230, 0.55)',
    lineH:     'rgba(180, 200, 230, 0.45)',
    lineHBold: 'rgba(180, 200, 230, 0.45)',
    lineRed:   'rgba(220, 80, 80, 0.35)',
};

const BG_DARK = {
    fill:      '#1a1a2a',
    lineV:     'rgba(80, 100, 150, 0.45)',
    lineH:     'rgba(80, 100, 150, 0.35)',
    lineHBold: 'rgba(80, 100, 150, 0.45)',
    lineRed:   'rgba(180, 60, 60, 0.35)',
};

function _currentBgImg() {
    const src = Theme.isDark() ? 'img/background_dark.png' : 'img/background.png';
    return (typeof Preloader !== 'undefined') ? Preloader.get(src) : null;
}

// tile height = 4 * GRID (один цикл из 4 строк: 3 тонких + 1 жирная)
const _BG_TILE_H = 4 * GRID;

// кеш тайлов: { light: OffscreenCanvas, dark: OffscreenCanvas }
const _bgTileCache = { light: null, dark: null };

function _buildBgTile(isDark) {
    const c   = isDark ? BG_DARK : BG_LIGHT;
    const oc  = createOffscreen(W, _BG_TILE_H);
    const oct = oc.getContext('2d');

    // заливка фона тайла
    oct.fillStyle = c.fill;
    oct.fillRect(0, 0, W, _BG_TILE_H);

    // вертикальные линии
    oct.beginPath();
    oct.strokeStyle = c.lineV;
    oct.lineWidth   = 0.6;
    for (let x = 0; x <= W; x += GRID) {
        oct.moveTo(x, 0);
        oct.lineTo(x, _BG_TILE_H);
    }
    oct.stroke();

    // горизонтальные тонкие (строки 0,1,2 из 4)
    oct.beginPath();
    oct.strokeStyle = c.lineH;
    oct.lineWidth   = 0.5;
    for (let row = 0; row < 4; row++) {
        if (row % 4 === 0) continue;
        const y = row * GRID;
        oct.moveTo(0, y);
        oct.lineTo(W, y);
    }
    oct.stroke();

    // горизонтальные жирные (строка 0 из 4)
    oct.beginPath();
    oct.strokeStyle = c.lineHBold;
    oct.lineWidth   = 0.8;
    oct.moveTo(0, 0);
    oct.lineTo(W, 0);
    oct.stroke();

    // красная вертикальная — рисуется поверх, единственная линия на весь тайл
    oct.beginPath();
    oct.strokeStyle = c.lineRed;
    oct.lineWidth   = 1.0;
    oct.moveTo(40, 0);
    oct.lineTo(40, _BG_TILE_H);
    oct.stroke();

    return oc;
}

function _getBgTile(isDark) {
    const key = isDark ? 'dark' : 'light';
    if (!_bgTileCache[key]) _bgTileCache[key] = _buildBgTile(isDark);
    return _bgTileCache[key];
}

// вызывается при смене темы — сбрасывает кеш нужного тайла
function invalidateBgTileCache() {
    _bgTileCache.light = null;
    _bgTileCache.dark  = null;
}

function drawMenuBackground() {
    const img = _currentBgImg();
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, W, H);
    } else {
        ctx.fillStyle = Theme.isDark() ? '#1a1a2a' : '#f0ede0';
        ctx.fillRect(0, 0, W, H);
    }
}

function drawBackground() {
    const isDark = Theme.isDark();
    const tile   = _getBgTile(isDark);

    // смещение тайла по Y синхронизировано с параллаксом камеры
    const oy = (((GameState.cameraY * 0.18) % _BG_TILE_H) + _BG_TILE_H) % _BG_TILE_H;

    // покрываем весь canvas: стартуем с одного тайла выше видимой области
    const startY = oy - _BG_TILE_H;
    for (let y = startY; y < H; y += _BG_TILE_H) {
        ctx.drawImage(tile, 0, y);
    }
}
