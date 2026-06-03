// совместимый фабрикант offscreen-канваса
// возвращает OffscreenCanvas если браузер поддерживает,
// иначе HTMLCanvasElement с идентичным 2d-контекстом

function createOffscreen(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(w, h);
    }
    const c = document.createElement('canvas');
    c.width  = w;
    c.height = h;
    return c;
}
