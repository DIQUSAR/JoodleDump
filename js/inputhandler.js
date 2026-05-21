// обработчик ввода

document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('touchstart', e => {
    if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (GameState.phase === 'playing') pauseGame();
        else if (GameState.phase === 'paused') resumeGame();
        return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
        if (GameState.phase === 'idle' || GameState.phase === 'dead') startGame();
        e.preventDefault();
        return;
    }
    const action = KEY_MAP[e.code] || KEY_MAP[e.key];
    if (action) GameState.keys[action] = true;
});

document.addEventListener('keyup', e => {
    const action = KEY_MAP[e.code] || KEY_MAP[e.key];
    if (action) GameState.keys[action] = false;
});

const btnLeft  = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');

['touchstart', 'mousedown'].forEach(ev => {
    btnLeft .addEventListener(ev, e => { e.preventDefault(); GameState.keys.left  = true; }, { passive: false });
    btnRight.addEventListener(ev, e => { e.preventDefault(); GameState.keys.right = true; }, { passive: false });
});
['touchend', 'mouseup', 'touchcancel'].forEach(ev => {
    btnLeft .addEventListener(ev, () => GameState.keys.left  = false);
    btnRight.addEventListener(ev, () => GameState.keys.right = false);
});

let ctrlScheme = 'keyboard';
try {
    const saved = localStorage.getItem('dj_ctrl');
    if (['keyboard', 'screen', 'gyro'].includes(saved)) ctrlScheme = saved;
} catch (_) {}

let _gyroGamma = 0;

function _startGyroListener() {
    window.addEventListener('deviceorientation', e => {
        if (e.gamma != null) _gyroGamma = e.gamma;
    }, true);
}

async function requestGyroPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res === 'granted') { _startGyroListener(); return 'granted'; }
            return 'denied';
        } catch { return 'denied'; }
    }
    if (window.DeviceOrientationEvent) { _startGyroListener(); return 'granted'; }
    return 'unavailable';
}

if (ctrlScheme === 'gyro') _startGyroListener();

function applyGyroToKeys() {
    if (ctrlScheme !== 'gyro') return;
    const DEAD_ZONE = 4;
    GameState.keys.left  = _gyroGamma < -DEAD_ZONE;
    GameState.keys.right = _gyroGamma >  DEAD_ZONE;
}
