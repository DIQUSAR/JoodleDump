// Получаем ссылку на холст
const canvas = document.getElementById('gameCanvas');
// Создаем 2D-контекст для рисования
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
// Элементы интерфейса для вывода инфы
const scoreEl = document.getElementById('scoreDisplay');
const highEl = document.getElementById('highScoreDisplay');
const diamondEl = document.getElementById('diamondDisplay');
// Элементы для меню и управления игрой
const overlay = document.getElementById('overlay');
const ctrlDiv = document.getElementById('controls');
// Адаптивное масшабирование
(function initScaler() {
    const GAME_W = 380;
    const GAME_H = 620;

    function scale() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Вычисляем scale чтобы заполнить экран по меньшей стороне (без отступов)
        const s = Math.min(
            vw / GAME_W,
            vh / GAME_H
        );

        const wrapper = document.getElementById('gameWrapper');
        if (wrapper) {
            wrapper.style.transform = `scale(${s})`;
        }
    }

    // Запускаем сразу и при изменении размера окна
    scale();
    window.addEventListener('resize', scale);

    // На iOS при появлении/скрытии клавиатуры тоже resize не всегда стреляет
    window.addEventListener('orientationchange', () => {
        setTimeout(scale, 150); // небольшая задержка — браузер ещё анимирует поворот
    });
})();
