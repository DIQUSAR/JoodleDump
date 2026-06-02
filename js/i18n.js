// СИСТЕМА ЛОКАЛИЗАЦИИ
// Добавить язык: новый ключ в LOCALES + перевод всех строк

const LOCALES = {
    ru: {
        title:          'Джудл\nДамп',
        platNormal:     'Обычная',
        platOneshot:    '1 прыжок',
        platFragile:    'Ломается',
        platMoving:     'Движется',
        btnStart:       'Старт',
        btnSoundOn:     'Звук вкл',
        btnSoundOff:    'Звук выкл',
        btnDarkOn:      'Тёмный',
        btnDarkOff:     'Светлый',
        ctrlKeyboard:   '\nКлавиши',
        ctrlScreen:     '\nЭкран',
        ctrlGyro:       '\nГироскоп',
        gyroDenied:     '❌ Запрещён',
        gyroUnavail:    '❌ Нет датчика',
        highScore:      'Рекорд: ',
        pauseTitle:     'Пауза',
        btnResume:      'Продолжить',
        btnRestart:     'Рестарт',
        btnMenu:        'Меню',
        deathTitle:     'Упал!',
        scoreLabel:     'Счёт: ',
        newRecord:      'Новый рекорд!',
        btnRetry:       'Снова',
        popupOops:      'УПС!',
        popupLast:      'ВСЁ!',
        popupSuperJump: 'СУПЕР!',
        langBtn:        'Русский',
        // Лидерборд
        lbLoading:      'Загрузка...',
        lbUnavailable:  'Недоступно',
        lbAuthRequired: 'Войдите для просмотра',
        lbEmpty:        'Пока никого нет',
        lbError:        'Ошибка загрузки',
        lbPlayer:       'Игрок',
        lbScore:        'Счёт',
        lbAnon:         'Аноним',
        lbTitle:        'Лидерборд',
        btnLeaderboard: 'Рекорды',
        btnSettings:    'Настройки',
        settingsTitle:  'Настройки',
        activeDoubleLabel:     'Двойной удар x3',
        activeDoubleDesc:      'x3 к шансу двойного алмаза',
        activeSuperJumpLabel:  'Суперпрыжок x3',
        activeSuperJumpDesc:   'x3 к шансу суперпрыжка',
        activeFeverLabel:  'Лихорадка x3',
        activeFeverDesc:   'x3 к шансу появления алмазов',
        activeActivate:    'Активировать',
        activeWatchAd:     'Смотреть рекламу',
        activeActive:      'Активно',
        activeCooldown:    'Кулдаун',
        activeRemaining:   'Осталось',
        activeMin:         'мин',
        activeSec:         'сек',
        // Пассивные навыки
        passiveFeverLabel: 'Алмазная лихорадка',
        passiveFeverDesc:  'Повышает шанс появления алмаза',
        passiveDoubleLabel: 'Двойной удар',
        passiveDoubleDesc:  'Шанс получить x2 алмаза при сборе',
        passiveSuperJumpLabel: 'Суперпрыжок',
        passiveSuperJumpDesc:  'Шанс прыгнуть в 1.5 раза выше',
        passiveLevel:      'Ур.',
        passiveMaxLevel:   'МАКС',
        passiveUpgrade:    'Прокачать',
        passivePassive:    'Пассивный',
        passiveActive:     'Активный',
        // Магазин
        shopTitle:      'Магазин',
        btnShop:        'Магазин',
        tabSkins:       'Скины',
        tabBoosts:      'Бусты',
        skinActive:     '✓ Выбран',
        skinSelect:     'Выбрать',
        skinBuy:        'Купить',
        yanUnit:        'ЯН',
        // Скины
        skinDood:       'Дудл',
        skinBlue:       'Синий',
        skinRed:        'Красный',
        skinGold:       'Золотой',
        skinDiamond:    'Алмазный',
        skinRuby:       'Рубиновый',
        skinRobo:       'Робот',
        skinPerkDiamondBonus: 'к алмазам',
        skinAdWatch:    'Смотреть',
        skinAdGoal:     '/{goal}',
        skinFashion:       'Модный',
        skinMafia:       'Мафиозник',
        // Возрождение за рекламу
        reviveOffer:    '👁 Смотри рекламу и продолжи с того же места!',
        btnRevive:      'Возродиться',
        btnSkipRevive:  'Пропустить',
    },

    en: {
        title:          'Joodle\nDump',
        platNormal:     'Normal',
        platOneshot:    '1 jump',
        platFragile:    'Breaks',
        platMoving:     'Moving',
        btnStart:       'Start',
        btnSoundOn:     'Sound on',
        btnSoundOff:    'Sound off',
        btnDarkOn:      'Dark',
        btnDarkOff:     'Light',
        ctrlKeyboard:   '\nKeys',
        ctrlScreen:     '\nTouch',
        ctrlGyro:       '\nGyro',
        gyroDenied:     '❌ Denied',
        gyroUnavail:    '❌ No sensor',
        highScore:      'Best: ',
        pauseTitle:     'Pause',
        btnResume:      'Resume',
        btnRestart:     'Restart',
        btnMenu:        'Menu',
        deathTitle:     'Fell!',
        scoreLabel:     'Score: ',
        newRecord:      'New record!',
        btnRetry:       'Again',
        popupOops:      'OOPS!',
        popupLast:      'GONE!',
        popupSuperJump: 'SUPER!',
        langBtn:        'English',
        // Leaderboard
        lbLoading:      'Loading...',
        lbUnavailable:  'Unavailable',
        lbAuthRequired: 'Sign in to view',
        lbEmpty:        'No entries yet',
        lbError:        'Load error',
        lbPlayer:       'Player',
        lbScore:        'Score',
        lbAnon:         'Anonymous',
        lbTitle:        'Leaderboard',
        btnLeaderboard: 'Records',
        btnSettings:    'Settings',
        settingsTitle:  'Settings',
        activeDoubleLabel:     'Double Strike x3',
        activeDoubleDesc:      'x3 double diamond chance',
        activeSuperJumpLabel:  'Super Jump x3',
        activeSuperJumpDesc:   'x3 super jump chance',
        activeFeverLabel:  'Fever x3',
        activeFeverDesc:   'x3 diamond spawn chance',
        activeActivate:    'Activate',
        activeWatchAd:     'Watch ad',
        activeActive:      'Active',
        activeCooldown:    'Cooldown',
        activeRemaining:   'Left',
        activeMin:         'min',
        activeSec:         'sec',
        // Passive skills
        passiveFeverLabel: 'Diamond Fever',
        passiveFeverDesc:  'Increases diamond spawn chance',
        passiveDoubleLabel: 'Double Strike',
        passiveDoubleDesc:  'Chance to collect x2 diamonds',
        passiveSuperJumpLabel: 'Super Jump',
        passiveSuperJumpDesc:  'Chance to jump 1.5x higher',
        passiveLevel:      'Lvl.',
        passiveMaxLevel:   'MAX',
        passiveUpgrade:    'Upgrade',
        passivePassive:    'Passive',
        passiveActive:     'Active',
        // Shop
        shopTitle:      'Shop',
        btnShop:        'Shop',
        tabSkins:       'Skins',
        tabBoosts:      'Boosts',
        skinActive:     '✓ Active',
        skinSelect:     'Select',
        skinBuy:        'Buy',
        yanUnit:        'YAN',
        // Skins
        skinDood:       'Dood',
        skinBlue:       'Blue',
        skinRed:        'Red',
        skinGold:       'Gold',
        skinDiamond:    'Diamond',
        skinRuby:       'Ruby',
        skinRobo:       'Robo',
        skinPerkDiamondBonus: 'to diamonds',
        skinAdWatch:    'Watch',
        skinAdGoal:     '/{goal}',
        skinFashion:       'Fashion',
        skinMafia:       'Mafia',
        // Revive for ad
        reviveOffer:    '👁 Watch an ad and continue from the same spot!',
        btnRevive:      'Revive',
        btnSkipRevive:  'Skip',
    },
};

const I18n = (() => {

    function _detect() {
        // URL
        try {
            const urlLang = new URLSearchParams(window.location.search).get('lang');
            if (urlLang) {
                const short = urlLang.slice(0, 2).toLowerCase();
                if (LOCALES[short]) return { lang: short, source: 'url' };
            }
        } catch (_) {}

        // localStorage
        try {
            const saved = localStorage.getItem('dj_lang');
            if (saved && LOCALES[saved]) return { lang: saved, source: 'manual' };
        } catch (_) {}

        // Браузер
        try {
            const nav = (navigator.language || navigator.userLanguage || '')
                .slice(0, 2).toLowerCase();
            if (LOCALES[nav]) return { lang: nav, source: 'navigator' };
        } catch (_) {}

        // Фолбэк
        return { lang: 'ru', source: 'fallback' };
    }

    const detected = _detect();
    let _lang   = detected.lang;
    let _source = detected.source; // откуда пришёл язык

    // Получить строку по ключу
    function t(key) {
        return (LOCALES[_lang] || LOCALES['ru'])[key] ?? key;
    }

    function getLang() { return _lang; }

    function setLang(lang) {
        if (!LOCALES[lang]) return;
        _lang   = lang;
        _source = 'manual';
        try { localStorage.setItem('dj_lang', lang); } catch (_) {}
    }

    function toggle() {
        setLang(_lang === 'ru' ? 'en' : 'ru');
    }

    async function initFromSDK() {
        try {
            const sdk = await SDK.get();
            if (!sdk) return;

            const sdkLang = sdk.environment?.i18n?.lang;
            if (!sdkLang) return;

            const short = sdkLang.slice(0, 2).toLowerCase();
            if (!LOCALES[short]) return;

            // Не перекрываем URL и ручной выбор
            if (_source === 'url' || _source === 'manual') return;

            if (_lang !== short) {
                _lang   = short;
                _source = 'sdk';
                // Перерисовать меню с новым языком если мы ещё в нём
                if (typeof state !== 'undefined' && state === 'idle') {
                    showMenu();
                }
            }
        } catch (_) {}
    }

    return { t, getLang, setLang, toggle, initFromSDK };
})();
