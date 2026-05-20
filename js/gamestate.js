// ГЛОБАЛЬНОЕ СОСТОЯНИЕ ИГРЫ
// Текущая стадия: 'idle'  'playing'  'paused'  'dead'
let state = 'idle';

// Основные игровые объекты
let player, platforms, score, cameraY;

// Спецэффекты
let particles = [], popups = [];

// Алмазы в воздухе
let diamonds = [];

// Рекорд читаем из localStorage при загрузке страницы
// Это гарантирует что рекорд не сбрасывается при перезагрузке
let highScore = (() => {
    try { return parseInt(localStorage.getItem('dj_highscore'), 10) || 0; }
    catch (_) { return 0; }
})();

// Точка возрождения — запоминается в момент смерти
// { x, y, cameraY } — позиция игрока и камеры на момент гибели
let reviveSavePoint = null;

// Флаги нажатых кнопок управления
let keys = { left: false, right: false };

const KEY_MAP = {
    'ArrowLeft':  'left',
    'KeyA':       'left',
    'a':          'left', 
    'ArrowRight': 'right',
    'KeyD':       'right',
    'd':          'right' 
};

let rafId = null;
