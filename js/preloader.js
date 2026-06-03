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
        'img/lock.png',
        'img/visibility.png',
    ];

    // карта: src → { img, ok }
    // ok=false если загрузка упала — _buildIconEl проверяет это и не клонирует сломанный объект
    const _cache = {};
    let _loaded   = 0;

    function _updateBar() {
        const bar = document.getElementById('loadingBar');
        if (!bar) return;
        bar.style.width = Math.round((_loaded / IMAGES.length) * 100) + '%';
    }

    function _loadOne(src) {
        return new Promise(resolve => {
            if (_cache[src]) { resolve(_cache[src].img); return; }

            const img = new Image();

            img.onload = () => {
                _cache[src] = { img, ok: true };
                _loaded++;
                _updateBar();
                resolve(img);
            };

            img.onerror = () => {
                // сохраняем запись с ok:false чтобы не грузить повторно,
                // но _buildIconEl не будет клонировать сломанный элемент
                _cache[src] = { img, ok: false };
                _loaded++;
                _updateBar();
                resolve(null);
            };

            // decoding: async — браузер не блокирует main thread на декодировании
            // важно для iOS Safari и Android Chrome при большом кол-ве картинок
            img.decoding = 'async';

            // fetchpriority — намекаем браузеру на приоритет мелких иконок
            img.fetchPriority = 'auto';

            img.src = src;
        });
    }

    // возвращает img из кэша только если загрузка прошла успешно
    function get(src) {
        const entry = _cache[src];
        return (entry && entry.ok) ? entry.img : null;
    }

    function run() {
        const audioFetch = typeof Audio !== 'undefined'
            ? Audio._fetchAllPromise || Promise.resolve()
            : Promise.resolve();
        return Promise.all([...IMAGES.map(_loadOne), audioFetch]);
    }

    return { run, get };
})();
