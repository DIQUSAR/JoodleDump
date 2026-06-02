// предзагрузка всех картинок игры
// возвращает Promise, который резолвится когда все img загружены
// обновляет прогресс-бар на loadingScreen по мере загрузки

const Preloader = (() => {

    const IMAGES = [
        'img/JoodleDump.png',
        'img/JoodleDumpDark.png',
        'img/arrow_left.png',
        'img/arrow_right.png',
        'img/background.png',
        'img/background_dark.png',
        'img/boosts.png',
        'img/dark_mode.png',
        'img/diamond.png',
        'img/diamond_chance.png',
        'img/diamond_chance_x3.png',
        'img/diamond_double.png',
        'img/diamond_double_x3.png',
        'img/dood.png',
        'img/dood_blue.png',
        'img/dood_diamond.png',
        'img/dood_fashion.png',
        'img/dood_gold.png',
        'img/dood_mafia.png',
        'img/dood_red.png',
        'img/dood_robo.png',
        'img/dood_ruby.png',
        'img/gyro.png',
        'img/jump_boost.png',
        'img/jump_boost_x3.png',
        'img/keyboard.png',
        'img/lang.png',
        'img/lb.png',
        'img/light_mode.png',
        'img/menu.png',
        'img/pause.png',
        'img/play.png',
        'img/restart.png',
        'img/revive.png',
        'img/settings.png',
        'img/shop.png',
        'img/skins.png',
        'img/skip.png',
        'img/sound_off.png',
        'img/sound_on.png',
        'img/touch.png',
        'img/wallet.png',
    ];

    const _cache = {};
    let _loaded  = 0;

    function _updateBar() {
        const bar = document.getElementById('loadingBar');
        if (!bar) return;
        bar.style.width = Math.round((_loaded / IMAGES.length) * 100) + '%';
    }

    function _loadOne(src) {
        return new Promise(resolve => {
            if (_cache[src]) { resolve(_cache[src]); return; }
            const img  = new Image();
            img.onload = img.onerror = () => {
                _cache[src] = img;
                _loaded++;
                _updateBar();
                resolve(img);
            };
            img.src = src;
        });
    }

    // возвращает уже загруженный img из кэша (для переиспользования в модулях)
    function get(src) { return _cache[src] || null; }

    function run() {
        // аудио fetch параллельно с картинками
        // _fetchAll() уже вызван в audio.js при загрузке модуля,
        // здесь получаем его Promise чтобы дождаться завершения
        const audioFetch = typeof Audio !== 'undefined'
            ? Audio._fetchAllPromise || Promise.resolve()
            : Promise.resolve();
        return Promise.all([...IMAGES.map(_loadOne), audioFetch]);
    }

    return { run, get };
})();
