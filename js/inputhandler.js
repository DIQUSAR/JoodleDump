// ОБРАБОТЧИК ВВОДА

// Блокируем контекстное меню при правом клике и долгом тапе (п. 1.6.2.7)
document.addEventListener('contextmenu', e => e.preventDefault());

// Блокируем системный тач-каллаут на iOS (выделение при долгом тапе)
document.addEventListener('touchstart', e => {
    if (e.touches.length > 1) e.preventDefault(); // блокируем пинч-зум
}, { passive: false });
document.addEventListener('keydown', e => {
    // Пауза по Escape
    if (e.key === 'Escape') {
        if (state === 'playing') pauseGame();
        else if (state === 'paused') resumeGame();
        return;
    }
    // Старт по пробелу или Enter
    if (e.key === ' ' || e.key === 'Enter') {
        if (state === 'idle' || state === 'dead') startGame();
        e.preventDefault(); // Блокируем скролл страницы пробелом
        return;
    }

    const action = KEY_MAP[e.code] || KEY_MAP[e.key];
    if (action) keys[action] = true;
});
// Отпускание клавиши
document.addEventListener('keyup', e => {
    const action = KEY_MAP[e.code] || KEY_MAP[e.key];
    if (action) keys[action] = false;
});
// ЭКРАННЫЕ КНОПКИ
const btnLeft  = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');

['touchstart', 'mousedown'].forEach(ev => {
    btnLeft .addEventListener(ev, e => { e.preventDefault(); keys.left  = true; }, { passive: false });
    btnRight.addEventListener(ev, e => { e.preventDefault(); keys.right = true; }, { passive: false });
});
['touchend', 'mouseup', 'touchcancel'].forEach(ev => {

    btnLeft .addEventListener(ev, () => keys.left  = false);
    btnRight.addEventListener(ev, () => keys.right = false);
});
// АКСЕЛЕРОМЕТР
let ctrlScheme = 'keyboard'; // keyboard screen gyro
try {
    const saved = localStorage.getItem('dj_ctrl');
    if (['keyboard', 'screen', 'gyro'].includes(saved)) ctrlScheme = saved;
} catch (_) {}
// Текущий угол наклона (градусы)
let _gyroGamma = 0;
// Начинаем слушать deviceorientation
function _startGyroListener() {
    window.addEventListener('deviceorientation', e => {
        if (e.gamma != null) _gyroGamma = e.gamma;
    }, true);
}
// Запрос разрешения для iOS 13+
async function requestGyroPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res === 'granted') { _startGyroListener(); return 'granted'; }
            return 'denied';
        } catch { return 'denied'; }
    }
    // Android / desktop разрешений не требует
    if (window.DeviceOrientationEvent) { _startGyroListener(); return 'granted'; }
    return 'unavailable';
}
// Если gyro уже был выбран раньше, запускаем слушатель сразу
if (ctrlScheme === 'gyro') _startGyroListener();
// Применяем gyro к keys каждый кадр
function applyGyroToKeys() {
    if (ctrlScheme !== 'gyro') return;
    const DEAD_ZONE = 4; // мёртвая зона чтобы не дрейфовало
    keys.left  = _gyroGamma < -DEAD_ZONE;
    keys.right = _gyroGamma >  DEAD_ZONE;
}
