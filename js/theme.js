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
        if (typeof applyBodyBackground === 'function') applyBodyBackground();
    }

    _load();

    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', () => {
            _applyClass();
            if (typeof applyBodyBackground === 'function') applyBodyBackground();
        });
    }

    return { isDark, toggle };
})();
