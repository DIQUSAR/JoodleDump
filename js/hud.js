// hud.js — управление элементами счёта и баланса
// единственный модуль который трогает эти DOM-узлы
// обновления точечные: один метод = один элемент

const HUD = (() => {

    const _els = {
        score:   document.getElementById('scoreDisplay'),
        high:    document.getElementById('highScoreDisplay'),
        diamond: document.getElementById('diamondDisplay'),
    };

    // точечные обновления

    function setScore(v) {
        _els.score.textContent = v;
    }

    function setHigh(v) {
        _els.high.textContent = I18n.t('highScore') + v;
    }

    function setBalance(v) {
        _els.diamond.innerHTML = DIAMOND_CFG.uiIcon + ' ' + v;
    }

    function show() {
        _els.score.style.display   = '';
        _els.high.style.display    = '';
        _els.diamond.style.display = '';
    }

    function hide() {
        _els.score.style.display   = 'none';
        _els.high.style.display    = 'none';
        _els.diamond.style.display = 'none';
    }

    // подписка на изменение баланса — вызывается из initStaticUI
    function init() {
        Currency.onChange(setBalance);
    }

    return { init, setScore, setHigh, setBalance, show, hide };
})();
