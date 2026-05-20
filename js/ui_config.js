// ═══════════════════════════════════════════════════════════════════════
//  UI CONFIG — единственное место для настройки внешнего вида игры
// ═══════════════════════════════════════════════════════════════════════
//
//  КАК ПОЛЬЗОВАТЬСЯ
//  ─────────────────
//  Каждый блок соответствует конкретному элементу интерфейса.
//  Все поля необязательны — убери комментарий у нужного.
//
//  icon: {
//    src:      'img/x.png',          // путь к картинке | null = убрать иконку
//    size:     '20px',               // ширина и высота (квадрат)
//    position: 'prefix',             // 'prefix' | 'suffix' | 'replace'
//    gap:      '6px',                // отступ между иконкой и текстом
//    style:    'opacity:0.8',        // дополнительные inline-стили для <img>
//  }
//
//  text: 'Новый текст'              // заменить надпись на кнопке/заголовке
//
//  style: {                         // CSS-свойства элемента (camelCase)
//    fontSize:     '20px',
//    color:        '#e84040',
//    background:   '#222',
//    padding:      '10px 24px',
//    borderRadius: '14px',
//    fontWeight:   '700',
//    letterSpacing:'1px',
//    // ... любые CSS-свойства
//  }
//
//  addClass:    'my-class'          // добавить CSS-класс
//  removeClass: 'old-class'         // убрать CSS-класс
//
//  ПРИМЕРЫ
//  ────────
//  Иконка перед текстом:
//    icon: { src: 'img/play.png', size: '20px', position: 'prefix', gap: '8px' }
//
//  Только картинка, без текста:
//    icon: { src: 'img/pause.png', size: '28px', position: 'replace' }
//
//  Только текст (убрать иконку):
//    icon: { src: null }, text: 'Старт'
//
//  Стиль + иконка вместе:
//    icon: { src: 'img/x.png', size: '18px', position: 'prefix' },
//    style: { fontSize: '18px', background: '#e84040', color: '#fff' }
//
// ═══════════════════════════════════════════════════════════════════════

const UI_CONFIG = {

    // ФОН
    // Картинка за пределами игрового экрана
    background: {
        src:      'img/JoodleDump.png',   // null = цвет из CSS (body background)
        size:     'cover',                 // 'cover' | 'contain' | 'repeat' | 'auto'
        position: 'center',               // 'center' | 'top left' | '50% 20%' | ...
    },

    // КНОПКА ПАУЗЫ два состояния
    // Состояние переключается автоматически при pauseGame() / resumeGame()
    pauseBtn: {
        // Игра идёт → кнопка означает "поставить паузу"
        pause: {
            icon: { src: 'img/pause.png', size: '25px', position: 'replace' },
            // text: '⏸',
            // style: { background: 'transparent', border: 'none' },
        },
        // Игра на паузе → кнопка означает "продолжить"
        play: {
            icon: { src: 'img/play.png', size: '25px', position: 'replace' },
            // text: '▶',
            // style: { background: 'transparent', border: 'none' },
        },
    },

    // КНОПКА ЗВУКА два состояния
    // Состояние переключается автоматически при toggleMute()
    // text: null → берётся из i18n (btnSoundOn / btnSoundOff)
    muteBtn: {
        // Звук включён → кнопка означает "выключить"
        on: {
            icon: { src: 'img/sound_on.png', size: '25px', position: 'prefix', gap: '2px' },
            text: null,   // null = читать из i18n ключ btnSoundOn
            // style: {},
        },
        // Звук выключен → кнопка означает "включить"
        off: {
            icon: { src: 'img/sound_off.png', size: '25px', position: 'prefix', gap: '2px' },
            text: null,   // null = читать из i18n ключ btnSoundOff
            // style: {},
        },
    },

    // ЭЛЕМЕНТЫ ИНТЕРФЕЙСА
    // Ключ = CSS-селектор. Текст берётся из i18n автоматически
    // поле text здесь переопределяет i18n для данного элемента
    elements: {
        //  ГЛАВНОЕ МЕНЮ
        // Заголовок игры (I18n: title)
        'h1': {
            // text: 'Joodle\nDump',
            // style: { fontSize: '48px', color: '#e84040', lineHeight: '1.1' },
        },

        // Рекорд над кнопками (I18n: highScore)
        '#menuRecord': {
            icon: { src: 'img/lb.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Рекорд: ',
            // style: { fontSize: '18px', color: '#444' },
        },

        // Версия игры
        '#showversion': {
            // text: 'v1.3.1',
            style: { fontSize: '11px', color: '#777777' },
        },

        // Кнопка Старт (I18n: btnStart)
        '#startBtn': {
            icon: { src: 'img/play.png', size: '24px', position: 'prefix', gap: '2px' },
            // text: 'Играть',
            // style: { fontSize: '20px' },
        },

        // Кнопка Магазин (I18n: btnShop)
        '#shopBtn': {
            icon: { src: 'img/shop.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Магазин',
            // style: {},
        },

        // Кнопка Лидерборд (I18n: btnLeaderboard)
        '#lbBtn': {
            icon: { src: 'img/lb.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Рекорды',
            // style: {},
        },

        // Кнопка Настройки (I18n: btnSettings)
        '#settingsBtn': {
            icon: { src: 'img/settings.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Настройки',
            // style: {},
        },

        // Легенда платформ
        // I18n: platNormal, platOneshot, platFragile, platMoving
        // Текст платформ в легенде меняется только через i18n.js
        // Стиль всего блока:
        '.legend': {
            // style: { fontSize: '13px', gap: '8px' },
        },

        // Схема управления каждая кнопка отдельно
        // I18n: ctrlKeyboard, ctrlScreen, ctrlGyro
        '[data-scheme="keyboard"]': {
            icon: { src: 'img/keyboard.png', size: '22px', position: 'prefix', gap: '0px' },
            // text: 'Клавиши',
            // style: { fontSize: '12px' },
        },

        '[data-scheme="screen"]': {
            icon: { src: 'img/touch.png', size: '22px', position: 'prefix', gap: '0px' },
            // text: 'Экран',
            // style: { fontSize: '12px' },
        },

        '[data-scheme="gyro"]': {
            icon: { src: 'img/gyro.png', size: '22px', position: 'prefix', gap: '0px' },
            // text: 'Гироскоп',
            // style: { fontSize: '12px' },
        },

        // Экранные кнопки управления (видны только в режиме "screen")
        // По умолчанию символы ◀ и ▶ задаются в index.html

        '#btnLeft': {
            icon: { src: 'img/arrow_left.png', size: '36px', position: 'replace', gap: '0px' },
            // text: '←',
            // style: { fontSize: '30px' },
        },

        '#btnRight': {
            icon: { src: 'img/arrow_right.png', size: '36px', position: 'replace', gap: '0px' },
            // text: '→',
            // style: { fontSize: '30px' },
        },

        //  ПАУЗА
        // Заголовок паузы (I18n: pauseTitle)
        '#pauseTitle': {
            // text: 'Пауза',
            // style: { fontSize: '36px', color: '#222' },
        },

        // Кнопка Продолжить (I18n: btnResume)
        '#btnResume': {
            icon: { src: 'img/play.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Продолжить',
            // style: {},
        },

        // Кнопка Рестарт (I18n: btnRestart)
        '#btnRestart': {
            icon: { src: 'img/restart.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Рестарт',
            // style: {},
        },

        // Кнопка Меню в паузе (I18n: btnMenu)
        '#btnPauseMenu': {
            icon: { src: 'img/menu.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Меню',
            // style: {},
        },

        //  ЭКРАН СМЕРТИ — ПРЕДЛОЖЕНИЕ ВОЗРОЖДЕНИЯ
        // Заголовок "Упал!" (I18n: deathTitle)
        // Применяется через CSS-контекст overlay, h1 внутри overlay
        // '#overlay h1': уже покрыто через 'h1' выше

        // Текст предложения посмотреть рекламу (I18n: reviveOffer)
        '#reviveOfferText': {
            // text: 'Смотри рекламу и продолжи!',
            // style: { fontSize: '15px', color: '#555' },
        },

        // Кнопка Возродиться (I18n: btnRevive)
        '#btnRevive': {
            icon: { src: 'img/revive.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Возродиться',
            // style: {},
        },

        // Кнопка Пропустить (I18n: btnSkipRevive)
        '#btnSkipRevive': {
            icon: { src: 'img/skip.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Пропустить',
            // style: { fontSize: '16px' },
        },

        //  GAME OVER
        // Кнопка Снова (I18n: btnRetry)
        '#btnRetry': {
            icon: { src: 'img/play.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Снова',
            // style: {},
        },

        // Кнопка Меню в game over (I18n: btnMenu)
        '#btnMenu': {
            icon: { src: 'img/menu.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Меню',
            // style: {},
        },

        //  НАСТРОЙКИ
        // Заголовок настроек (I18n: settingsTitle)
        '#settingsTitle': {
            icon: { src: 'img/settings.png', size: '50px', position: 'prefix', gap: '2px' },
            // text: 'Настройки',
            // style: { fontSize: '28px' },
        },

        // Кнопка звука управляется через muteBtn выше
        // Дополнительные стили кнопки:
        '#settingsMuteBtn': {
            // style: { minWidth: '180px' },
        },

        // Кнопка смены языка (I18n: langBtn)
        '#settingsLangBtn': {
            icon: { src: 'img/lang.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'EN / RU',
            // style: {},
        },

        // Кнопка закрыть в настройках (кнопка ✕ в шапке)
        '#btnSettingsBack': {
            icon: { src: 'img/skip.png', size: '20px', position: 'replace', gap: '2px' },
            // text: '✕',
            // style: { fontSize: '18px' },
        },

        //  ЛИДЕРБОРД
        // Заголовок лидерборда (I18n: lbTitle)
        '#lbTitle': {
            icon: { src: 'img/lb.png', size: '50px', position: 'prefix', gap: '2px' },
            // text: 'Лидерборд',
            // style: { fontSize: '26px' },
        },

        // Кнопка закрыть в лидерборде (кнопка ✕ в шапке)
        '#btnLBBack': {
            icon: { src: 'img/skip.png', size: '20px', position: 'replace' },
            // text: '✕',
            // style: { fontSize: '18px' },
        },

        //  МАГАЗИН
        // Заголовок магазина (I18n: shopTitle)
        '.shop-title': {
            icon: { src: 'img/shop.png', size: '30px', position: 'prefix', gap: '2px' },
            // text: 'Магазин',
            // style: { fontSize: '22px' },
        },

        // Вкладка Скины (I18n: tabSkins)
        '[data-tab="skins"]': {
            icon: { src: 'img/skins.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Скины',
            // style: { fontSize: '14px' },
        },

        // Вкладка Бусты (I18n: tabBoosts)
        '[data-tab="boosts"]': {
            icon: { src: 'img/boosts.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: 'Бусты',
            // style: { fontSize: '14px' },
        },

        // Кнопка закрыть / назад в магазине
        '#shopBack': {
            icon: { src: 'img/skip.png', size: '20px', position: 'replace' },
            // style: { fontSize: '18px' },
        },

        // Кнопка просмотра рекламы в магазине (шапка)
        '#shopAdBtn': {
            icon: { src: 'img/revive.png', size: '25px', position: 'prefix', gap: '2px' },
            // text: '+10💎',
            // style: {},
        },

        // Кнопка "Смотреть рекламу" в активных бустах
        // Применяется ко всем трём карточкам одновременно
        '.active-ad-btn': {
            icon: { src: 'img/revive.png', size: '18px', position: 'prefix', gap: '2px' },
        },

        // Иконка пассивного навыка "Алмазная лихорадка"
        '[data-passive="diamondFever"] .boost-passive-icon': {
            icon: { src: 'img/diamond_chance.png', size: '40px', position: 'replace' },
        },

        // Иконка пассивного навыка "Двойной удар"
        '[data-passive="doubleDiamond"] .boost-passive-icon': {
            icon: { src: 'img/diamond_double.png', size: '40px', position: 'replace' },
        },

        // Иконка пассивного навыка "Суперпрыжок"
        '[data-passive="superJump"] .boost-passive-icon': {
            icon: { src: 'img/jump_boost.png', size: '40px', position: 'replace' },
        },

        // Бейдж "Выбран" на скине (I18n: skinActive)
        '.shop-badge.active': {
            // text: '✓ Выбран',
            // style: { fontSize: '11px' },
        },

        // Бейдж "Выбрать" на скине (I18n: skinSelect)
        '.shop-badge.owned': {
            // text: 'Выбрать',
            // style: { fontSize: '11px' },
        },

        // Бейдж цены
        '.shop-badge.price': {
            // style: { fontSize: '11px' },
        },
    },
};

// ДВИЖОК не редактировать

// Обёртка для i18n.t() — используется внутри конфига до инициализации I18n
// (значения из muteBtn.on/off вычисляются в рантайме, не при загрузке файла)
function I18n_t(key) {
    return typeof I18n !== 'undefined' ? I18n.t(key) : key;
}

function _applyBackground() {
    const cfg = UI_CONFIG.background;
    if (!cfg || !cfg.src) return;
    document.body.style.backgroundImage      = `url('${cfg.src}')`;
    document.body.style.backgroundSize       = cfg.size     || 'cover';
    document.body.style.backgroundPosition   = cfg.position || 'center';
    document.body.style.backgroundRepeat     = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
}

function _buildIconHTML(iconCfg) {
    if (!iconCfg || !iconCfg.src) return null;
    const size  = iconCfg.size  || '18px';
    const extra = iconCfg.style || '';
    return `<img src="${iconCfg.src}" data-ui-icon="1" `
        + `style="width:${size};height:${size};object-fit:contain;`
        + `vertical-align:middle;flex-shrink:0;${extra}" draggable="false">`;
}

function _applyToElement(el, cfg) {
    if (!cfg || !el) return;

    if (cfg.style)       Object.assign(el.style, cfg.style);
    if (cfg.addClass)    el.classList.add(cfg.addClass);
    if (cfg.removeClass) el.classList.remove(cfg.removeClass);

    const ic = cfg.icon;
    if (ic) {
        const iconHTML = _buildIconHTML(ic);
        if (iconHTML) {
            if (ic.position === 'replace') {
                el.innerHTML = iconHTML;
            } else {
                const oldIcon = el.querySelector('img[data-ui-icon]');
                const text    = oldIcon ? el.textContent.trim() : el.innerHTML.trim();
                const gap     = `<span style="display:inline-block;width:${ic.gap || '6px'}"></span>`;
                el.innerHTML  = ic.position === 'suffix'
                    ? text + gap + iconHTML
                    : iconHTML + gap + text;
            }
        }
    }

    if (cfg.text !== undefined) {
        if (ic && ic.position !== 'replace') {
            const img = el.querySelector('img[data-ui-icon]');
            el.innerHTML = img
                ? (ic.position === 'suffix' ? cfg.text + img.outerHTML : img.outerHTML + cfg.text)
                : cfg.text;
        } else if (!ic) {
            el.textContent = cfg.text;
        }
    }
}

function applyUIConfig(root) {
    const ctx = root || document;
    for (const [selector, cfg] of Object.entries(UI_CONFIG.elements || {})) {
        if (!cfg || Object.keys(cfg).length === 0) continue;
        ctx.querySelectorAll(selector).forEach(el => _applyToElement(el, cfg));
    }
}

// Переключить кнопку паузы
// isPaused=true  → состояние "play"  (нажать чтобы продолжить)
// isPaused=false → состояние "pause" (нажать чтобы поставить паузу)
function updatePauseBtnUI(isPaused) {
    const btn = document.getElementById('pauseBtn');
    if (!btn) return;
    const cfg   = UI_CONFIG.pauseBtn || {};
    const state = isPaused ? cfg.play : cfg.pause;

    btn.innerHTML = '';

    if (state && state.icon && state.icon.src) {
        const iconHTML = _buildIconHTML(state.icon);
        if (state.icon.position === 'replace') {
            btn.innerHTML = iconHTML || '';
        } else {
            const label = (state.text || (isPaused ? '▶' : '⏸'));
            const gap   = `<span style="display:inline-block;width:${state.icon.gap || '6px'}"></span>`;
            btn.innerHTML = state.icon.position === 'suffix'
                ? label + gap + iconHTML
                : iconHTML + gap + label;
        }
    } else {
        btn.textContent = (state && state.text) || (isPaused ? '▶' : '⏸');
    }
}

// Синхронизировать кнопку звука
// Вызывать каждый раз после изменения состояния мута
function updateMuteBtnUI(btn) {
    if (!btn) return;
    const muted = typeof Audio !== 'undefined' && Audio.isMuted();
    const cfg   = (UI_CONFIG.muteBtn || {})[muted ? 'off' : 'on'] || {};

    // Текст из конфига или из i18n
    const label = cfg.text || I18n_t(muted ? 'btnSoundOff' : 'btnSoundOn');
    _applyToElement(btn, { ...cfg, text: label });

    // Стили из elements (дополнительные стили кнопки)
    const elCfg = (UI_CONFIG.elements || {})['#settingsMuteBtn'];
    if (elCfg && elCfg.style) Object.assign(btn.style, elCfg.style);
}

// Применить фон при загрузке страницы
_applyBackground();
