// Платформы
function makePlatform(x, y, type) {
    const p = { x, y, w: 62, h: 12, type, used: false, alpha: 1, breaking: false, breakTimer: 0 };
    return p;
}
// Цвета платформ
const PLAT_COLORS = {
  normal: { fill:'#5cb85c', stroke:'#3a7a34' },
  oneshot: { fill:'#f0a030', stroke:'#b05510' },
  fragile: { fill:'#e84040', stroke:'#901010' },
  moving: { fill:'#2196f3', stroke:'#0d47a1' },
};
// Рендер платформы
function drawPlatform(p) {
  if (p.alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = p.alpha;
  const c = PLAT_COLORS[p.type] || PLAT_COLORS.normal;
  // Основная часть платформы — ручной roundRect через arcTo (совместимость со старыми WebView)
  const r = 5;
  const x = p.x, y = p.y, w = p.w, h = p.h;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
  ctx.fillStyle = c.fill;
  ctx.fill();
  ctx.strokeStyle = c.stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Нарисованная от руки закорючка на платформе
  ctx.strokeStyle = c.stroke;
  ctx.lineWidth = 1;
  ctx.beginPath();
  let first = true;
  for (let i = 0; i < p.w - 10; i += 7) {
    const rx = p.x + 5 + i;
    const ry = p.y + 3.5 + (Math.floor(i/7) % 2 === 0 ? -1 : 1);
    if (first) { ctx.moveTo(rx, ry); first = false; } else ctx.lineTo(rx, ry);
  }
  ctx.stroke();
  ctx.restore();
}