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
        // строим DOM вместо innerHTML — совместимость с Android WebView
        const el = _els.diamond;
        el.innerHTML = '';
        const img = document.createElement('img');
        img.src = DIAMOND_CFG.imgSrc;
        img.style.cssText = 'width:24px;height:24px;vertical-align:middle;flex-shrink:0;';
        img.alt = '';
        img.setAttribute('draggable', 'false');
        el.appendChild(img);
        el.insertAdjacentText('beforeend', ' ' + v);
    }

    function show() {
        _els.score.style.display   = 'block';
        _els.high.style.display    = 'block';
        _els.diamond.style.display = 'block';
    }

    function hide() {
        _els.score.style.display   = 'none';
        _els.high.style.display    = 'none';
        _els.diamond.style.display = 'none';
    }

    // подписка на изменение баланса — вызывается из initStaticUI
    function init() {
        hide();
        setBalance(Currency.get());
        Currency.onChange(setBalance);
    }

    return { init, setScore, setHigh, setBalance, show, hide };
})();
