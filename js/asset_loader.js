// предзагрузка всех ассетов до старта игры
// изображения — через Image(), аудио — через fetch (raw bytes)
// прогресс передаётся в onProgress(loaded, total)

const AssetLoader = (() => {

    const IMAGES = [
        "img/JoodleDump.png",
        "img/JoodleDumpDark.png",
        "img/arrow_left.png",
        "img/arrow_right.png",
        "img/background.png",
        "img/background_dark.png",
        "img/boosts.png",
        "img/dark_mode.png",
        "img/diamond.png",
        "img/diamond_chance.png",
        "img/diamond_chance_x3.png",
        "img/diamond_double.png",
        "img/diamond_double_x3.png",
        "img/dood.png",
        "img/dood_blue.png",
        "img/dood_diamond.png",
        "img/dood_fashion.png",
        "img/dood_gold.png",
        "img/dood_mafia.png",
        "img/dood_red.png",
        "img/dood_robo.png",
        "img/dood_ruby.png",
        "img/gyro.png",
        "img/jump_boost.png",
        "img/jump_boost_x3.png",
        "img/keyboard.png",
        "img/lang.png",
        "img/lb.png",
        "img/light_mode.png",
        "img/menu.png",
        "img/pause.png",
        "img/play.png",
        "img/restart.png",
        "img/revive.png",
        "img/settings.png",
        "img/shop.png",
        "img/skins.png",
        "img/skip.png",
        "img/sound_off.png",
        "img/sound_on.png",
        "img/touch.png",
        "img/wallet.png",
    ];

    const AUDIO_SRCS = [
        "audio/audio_menu.mp3",
        "audio/audio_game.mp3",
        "audio/audio_jump.mp3",
        "audio/audio_diamond.mp3",
    ];

    // кэш загруженных Image — PlayerSprite и DiamondSprite используют
    // свои загрузчики, но они увидят файл уже из http-кэша браузера
    const _imgCache = {};

    function _loadImage(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload  = () => { _imgCache[src] = img; resolve(); };
            img.onerror = () => resolve(); // не блокируем загрузку при ошибке
            img.src = src;
        });
    }

    function _loadAudio(src) {
        return fetch(src)
            .then(r => r.arrayBuffer())
            .then(() => {}) // байты осядут в http-кэше браузера
            .catch(() => {});
    }

    // onProgress(loaded, total) — вызывается после каждого загруженного ассета
    function load(onProgress) {
        const all   = [...IMAGES, ...AUDIO_SRCS];
        const total = all.length;
        let loaded  = 0;

        const tasks = all.map(src => {
            const task = src.startsWith('audio/') ? _loadAudio(src) : _loadImage(src);
            return task.then(() => {
                loaded++;
                onProgress?.(loaded, total);
            });
        });

        return Promise.all(tasks);
    }

    return { load };
})();
