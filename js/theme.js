const Theme = (() => {
    let _dark = false;

    function _applyClass() {
        document.body.classList.toggle('dark', _dark);
    }

    function _load() {
        try { _dark = localStorage.getItem('dj_dark') === 'true'; } catch (_) {}
    }

    function _save() {
        try { localStorage.setItem('dj_dark', _dark); } catch (_) {}
    }

    function isDark() {
        return _dark;
    }

    function toggle() {
        _dark = !_dark;
        _save();
        _applyClass();
        if (typeof invalidateBgTileCache === 'function') invalidateBgTileCache();
        if (typeof applyBodyBackground === 'function') applyBodyBackground();
    }

    _load();
    // defer-скрипты выполняются после DOM — DOMContentLoaded уже случился,
    // применяем класс и фон сразу
    _applyClass();

    return { isDark, toggle };
})();
