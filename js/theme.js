// dark mode state and toggle logic
// persist: localStorage('dj_dark')
// consumers call Theme.isDark() to read current mode

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
    // apply class immediately so CSS dark rules fire on page load
    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', _applyClass);
    }

    return { isDark, toggle };
})();
