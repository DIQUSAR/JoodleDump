// центральный объект состояния игры
// мутации только через setState / setPhase
// прямые присваивания глобалов запрещены

const GameState = {
    phase:          'idle',   // 'idle' | 'playing' | 'paused' | 'dead'
    player:         null,
    platforms:      [],
    score:          0,
    cameraY:        0,
    particles:      [],
    popups:         [],
    diamonds:       [],
    keys:           { left: false, right: false },
    highScore:      0,
    reviveSavePoint: null,
    rafId:          null,
    loopRunning:    false,
};

// инициализируем рекорд из localStorage один раз
GameState.highScore = (() => {
    try { return parseInt(localStorage.getItem('dj_highscore'), 10) || 0; }
    catch (_) { return 0; }
})();

// частичное обновление состояния
// setState({ score: 5, cameraY: -200 })
function setState(patch) {
    Object.assign(GameState, patch);
}

// смена фазы игры с валидацией перехода
function setPhase(phase) {
    const valid = ['idle', 'playing', 'paused', 'dead'];
    if (!valid.includes(phase)) {
        console.warn('[GameState] неизвестная фаза:', phase);
        return;
    }
    GameState.phase = phase;
}

// KEY_MAP вынесен сюда т.к. используется в inputhandler.js
const KEY_MAP = {
    'ArrowLeft':  'left',
    'KeyA':       'left',
    'a':          'left',
    'ArrowRight': 'right',
    'KeyD':       'right',
    'd':          'right',
};

// ── обратная совместимость ───────────────────────────────────────
// позволяет остальным модулям читать/писать старые глобальные
// переменные пока идёт постепенный рефакторинг.
// после полного перехода — удалить этот блок.

Object.defineProperties(window, {
    state: {
        get() { return GameState.phase; },
        set(v) { setPhase(v); },
        configurable: true,
    },
    player: {
        get() { return GameState.player; },
        set(v) { GameState.player = v; },
        configurable: true,
    },
    platforms: {
        get() { return GameState.platforms; },
        set(v) { GameState.platforms = v; },
        configurable: true,
    },
    score: {
        get() { return GameState.score; },
        set(v) { GameState.score = v; },
        configurable: true,
    },
    cameraY: {
        get() { return GameState.cameraY; },
        set(v) { GameState.cameraY = v; },
        configurable: true,
    },
    particles: {
        get() { return GameState.particles; },
        set(v) { GameState.particles = v; },
        configurable: true,
    },
    popups: {
        get() { return GameState.popups; },
        set(v) { GameState.popups = v; },
        configurable: true,
    },
    diamonds: {
        get() { return GameState.diamonds; },
        set(v) { GameState.diamonds = v; },
        configurable: true,
    },
    keys: {
        get() { return GameState.keys; },
        set(v) { GameState.keys = v; },
        configurable: true,
    },
    highScore: {
        get() { return GameState.highScore; },
        set(v) { GameState.highScore = v; },
        configurable: true,
    },
    reviveSavePoint: {
        get() { return GameState.reviveSavePoint; },
        set(v) { GameState.reviveSavePoint = v; },
        configurable: true,
    },
    rafId: {
        get() { return GameState.rafId; },
        set(v) { GameState.rafId = v; },
        configurable: true,
    },
    _loopRunning: {
        get() { return GameState.loopRunning; },
        set(v) { GameState.loopRunning = v; },
        configurable: true,
    },
});
