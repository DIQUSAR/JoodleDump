// центральный объект состояния игры
// мутации только через setState / setPhase
// прямые присваивания глобалов запрещены

const GameState = {
    phase:           'idle',   // 'idle' | 'playing' | 'paused' | 'dead'
    player:          null,
    platforms:       [],
    score:           0,
    cameraY:         0,
    particles:       [],
    popups:          [],
    diamonds:        [],
    keys:            { left: false, right: false },
    highScore:       0,
    reviveSavePoint: null,
    rafId:           null,
    loopRunning:     false,
    tickTime:        0,        // текущее время тика (performance.now() / 1000)
};

GameState.highScore = (() => {
    try { return parseInt(localStorage.getItem('dj_highscore'), 10) || 0; }
    catch (_) { return 0; }
})();

function setState(patch) {
    Object.assign(GameState, patch);
}

function setPhase(phase) {
    const valid = ['idle', 'playing', 'paused', 'dead'];
    if (!valid.includes(phase)) {
        console.warn('[GameState] неизвестная фаза:', phase);
        return;
    }
    GameState.phase = phase;
}

const KEY_MAP = {
    'ArrowLeft':  'left',
    'KeyA':       'left',
    'a':          'left',
    'ArrowRight': 'right',
    'KeyD':       'right',
    'd':          'right',
};
