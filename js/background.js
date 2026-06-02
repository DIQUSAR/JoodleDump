// background renderer for menu and gameplay
// menu: background.png (light) / background_dark.png (dark)
// gameplay: solid fill + notebook grid lines

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

const _bgImgLight = new Image();
_bgImgLight.src = 'img/background.png';

const _bgImgDark = new Image();
_bgImgDark.src = 'img/background_dark.png';

function _currentBgImg() {
    return Theme.isDark() ? _bgImgDark : _bgImgLight;
}

function drawMenuBackground() {
    const img = _currentBgImg();
    if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, W, H);
    } else {
        ctx.fillStyle = Theme.isDark() ? '#1a1a2a' : '#f0ede0';
        ctx.fillRect(0, 0, W, H);
    }
}

function drawBackground() {
    const c = Theme.isDark() ? BG_DARK : BG_LIGHT;

    ctx.fillStyle = c.fill;
    ctx.fillRect(0, 0, W, H);

    const oy = ((GameState.cameraY * 0.18) % GRID + GRID) % GRID;

    ctx.beginPath();
    ctx.strokeStyle = c.lineV;
    ctx.lineWidth   = 0.6;
    for (let x = 0; x <= W; x += GRID) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = c.lineH;
    ctx.lineWidth   = 0.5;
    for (let y = -GRID + oy; y <= H; y += GRID) {
        if (Math.round((y - oy) / GRID) % 4 === 0) continue;
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = c.lineHBold;
    ctx.lineWidth   = 0.8;
    for (let y = -GRID + oy; y <= H; y += GRID) {
        if (Math.round((y - oy) / GRID) % 4 !== 0) continue;
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = c.lineRed;
    ctx.lineWidth   = 1.0;
    ctx.moveTo(40, 0);
    ctx.lineTo(40, H);
    ctx.stroke();
}
