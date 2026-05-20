// ВАЛЮТА: АЛМАЗЫ 💎

const Currency = (() => {

    const _KEY = 'dj_diamonds';

    // Читаем баланс один раз при старте
    let _balance = (() => {
        try { return Math.max(0, parseInt(localStorage.getItem(_KEY), 10) || 0); }
        catch (_) { return 0; }
    })();

    // Подписчики на изменение баланса — обновляют UI без связанности
    const _listeners = [];

    function _save() {
        try { localStorage.setItem(_KEY, _balance); } catch (_) {}
        _listeners.forEach(fn => fn(_balance));
    }

    // Текущий баланс
    function get() { return _balance; }

    // Начислить n алмазов (n > 0)
    function add(n) {
        if (n <= 0) return;
        _balance += n;
        _save();
    }

    // Потратить n алмазов. Возвращает true если успешно, false если не хватает
    function spend(n) {
        if (n <= 0 || _balance < n) return false;
        _balance -= n;
        _save();
        return true;
    }

    // Прямая установка баланса (используется при синхронизации с облаком)
    function set(n) {
        if (typeof n !== 'number' || n < 0) return;
        _balance = n;
        _save();
    }

    // Подписка на изменение баланса
    function onChange(fn) {
        _listeners.push(fn);
    }

    return { get, add, spend, set, onChange };
})();
