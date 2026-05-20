const _menuBgImg = new Image();
_menuBgImg.onload = () => drawMenuBackground();
_menuBgImg.src = 'img/background.jpg';

function drawMenuBackground() {
    if (_menuBgImg.complete && _menuBgImg.naturalWidth > 0) {
        ctx.drawImage(_menuBgImg, 0, 0, W, H);
    } else {
        ctx.fillStyle = '#f0ede0';
        ctx.fillRect(0, 0, W, H);
    }
}

function drawBackground() {
    ctx.fillStyle = '#f8f8f2';
    ctx.fillRect(0, 0, W, H);

    const oy = ((cameraY * 0.18) % GRID + GRID) % GRID;

    // Вертикальные линии — один path, один stroke()
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(180, 200, 230, 0.55)';
    ctx.lineWidth   = 0.6;
    for (let x = 0; x <= W; x += GRID) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
    }
    ctx.stroke();

    // Горизонтальные minor — один path, один stroke()
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(180, 200, 230, 0.45)';
    ctx.lineWidth   = 0.5;
    for (let y = -GRID + oy; y <= H; y += GRID) {
        if (Math.round((y - oy) / GRID) % 4 === 0) continue;
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
    }
    ctx.stroke();

    // Горизонтальные major — один path, один stroke()
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(180, 200, 230, 0.45)';
    ctx.lineWidth   = 0.8;
    for (let y = -GRID + oy; y <= H; y += GRID) {
        if (Math.round((y - oy) / GRID) % 4 !== 0) continue;
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
    }
    ctx.stroke();

    // Красная вертикальная линия
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(220, 80, 80, 0.35)';
    ctx.lineWidth   = 1.0;
    ctx.moveTo(40, 0);
    ctx.lineTo(40, H);
    ctx.stroke();
}
