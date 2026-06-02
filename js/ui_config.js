const UI_CONFIG = {

    background: {
        src:      'img/JoodleDump.png',
        srcDark:  'img/JoodleDumpDark.png',
        size:     'cover',
        position: 'center',
    },

    // two-state pause button; switches via pauseGame() / resumeGame()
    pauseBtn: {
        pause: {
            icon: { src: 'img/pause.png', size: '25px', position: 'replace', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },
        play: {
            icon: { src: 'img/play.png', size: '25px', position: 'replace', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },
    },

    // two-state mute button; text: null → taken from i18n (btnSoundOn / btnSoundOff)
    muteBtn: {
        on: {
            icon: { src: 'img/sound_on.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
            text: null,
        },
        off: {
            icon: { src: 'img/sound_off.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
            text: null,
        },
    },

    // two-state dark mode button; text: null → taken from i18n (btnDarkOn / btnDarkOff)
    darkBtn: {
        on: {
            icon: { src: 'img/dark_mode.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
            text: null,
        },
        off: {
            icon: { src: 'img/light_mode.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
            text: null,
        },
    },

    elements: {
        'h1': {},

        '#menuRecord': {
            icon: { src: 'img/lb.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#showversion': {
            style: { fontSize: '11px', color: '#777777' },
        },

        '#startBtn': {
            icon: { src: 'img/play.png', size: '24px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#shopBtn': {
            icon: { src: 'img/shop.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#lbBtn': {
            icon: { src: 'img/lb.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#settingsBtn': {
            icon: { src: 'img/settings.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '.legend': {},

        '[data-scheme="keyboard"]': {
            icon: { src: 'img/keyboard.png', size: '22px', position: 'prefix', gap: '0px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '[data-scheme="screen"]': {
            icon: { src: 'img/touch.png', size: '22px', position: 'prefix', gap: '0px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '[data-scheme="gyro"]': {
            icon: { src: 'img/gyro.png', size: '22px', position: 'prefix', gap: '0px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#btnLeft': {
            icon: { src: 'img/arrow_left.png', size: '36px', position: 'replace', gap: '0px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#btnRight': {
            icon: { src: 'img/arrow_right.png', size: '36px', position: 'replace', gap: '0px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#pauseTitle': {},

        '#btnResume': {
            icon: { src: 'img/play.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#btnRestart': {
            icon: { src: 'img/restart.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#btnPauseMenu': {
            icon: { src: 'img/menu.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#reviveOfferText': {},

        '#btnRevive': {
            icon: { src: 'img/revive.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#btnSkipRevive': {
            icon: { src: 'img/skip.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        // game over screen
        '#btnRetry': {
            icon: { src: 'img/play.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#btnMenu': {
            icon: { src: 'img/menu.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        // new record label in game over screen (I18n: newRecord)
        '#newRecordLabel': {
            icon: { src: 'img/lb.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
            // style: { color: '#e84040', fontWeight: '700' },
        },

        '#settingsTitle': {
            icon: { src: 'img/settings.png', size: '50px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#settingsMuteBtn': {},

        // dark mode toggle button — styled via darkBtn config above
        '#settingsDarkBtn': {},

        '#settingsLangBtn': {
            icon: { src: 'img/lang.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#btnSettingsBack': {
            icon: { src: 'img/skip.png', size: '20px', position: 'replace', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#lbTitle': {
            icon: { src: 'img/lb.png', size: '50px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#btnLBBack': {
            icon: { src: 'img/skip.png', size: '20px', position: 'replace', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '.shop-title': {
            icon: { src: 'img/shop.png', size: '30px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '[data-tab="skins"]': {
            icon: { src: 'img/skins.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '[data-tab="boosts"]': {
            icon: { src: 'img/boosts.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#shopBack': {
            icon: { src: 'img/skip.png', size: '20px', position: 'replace', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '#shopAdBtn': {
            icon: { src: 'img/revive.png', size: '25px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '.active-ad-btn': {
            icon: { src: 'img/revive.png', size: '18px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        '[data-passive="diamondFever"] .boost-passive-icon': {
            icon: { src: 'img/diamond_chance.png', size: '40px', position: 'replace' },
        },

        '[data-passive="doubleDiamond"] .boost-passive-icon': {
            icon: { src: 'img/diamond_double.png', size: '40px', position: 'replace' },
        },

        '[data-passive="superJump"] .boost-passive-icon': {
            icon: { src: 'img/jump_boost.png', size: '40px', position: 'replace' },
        },

        '.shop-badge.active': {},
        '.shop-badge.owned': {},
        '.shop-badge.price': {},

        // иконки перков скинов в карточках магазина
        '.perk-diamond': {
            icon: { src: 'img/diamond.png', size: '11px', position: 'replace' },
        },
        '.perk-score': {
            icon: { src: 'img/lb.png', size: '11px', position: 'replace',
                    tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },

        // иконка валюты янов на бейдже iap-скинов — заменить img/shop.png на свою картинку
        '[data-iap-badge]': {
            icon: { src: 'img/wallet.png', size: '12px', position: 'prefix', gap: '2px', tint: 'invert(48%) sepia(28%) saturate(4019%) hue-rotate(80deg) brightness(100%) contrast(91%)' },
        },

        // иконка на бейдже скина за рекламу (Робо)
        '[data-ad-badge]': {
            icon: { src: 'img/revive.png', size: '12px', position: 'prefix', gap: '2px', tint: 'invert(69%) sepia(89%) saturate(3237%) hue-rotate(0deg) brightness(103%) contrast(104%)' },
        },
    },
};

function I18n_t(key) {
    return typeof I18n !== 'undefined' ? I18n.t(key) : key;
}

function applyBodyBackground() {
    const cfg = UI_CONFIG.background;
    if (!cfg) return;
    const src = (typeof Theme !== 'undefined' && Theme.isDark() && cfg.srcDark)
        ? cfg.srcDark
        : cfg.src;
    if (!src) return;
    document.body.style.backgroundImage      = `url('${src}')`;
    document.body.style.backgroundSize       = cfg.size     || 'cover';
    document.body.style.backgroundPosition   = cfg.position || 'center';
    document.body.style.backgroundRepeat     = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
}

function _buildIconHTML(iconCfg) {
    if (!iconCfg || !iconCfg.src) return null;
    const size   = iconCfg.size   || '18px';
    const extra  = iconCfg.style  || '';
    const filter = iconCfg.tint   ? `filter:${iconCfg.tint};` : '';
    return `<img src="${iconCfg.src}" data-ui-icon="1" `
        + `style="width:${size};height:${size};object-fit:contain;`
        + `vertical-align:middle;flex-shrink:0;${filter}${extra}" draggable="false">`;
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

function updateMuteBtnUI(btn) {
    if (!btn) return;
    const muted = typeof Audio !== 'undefined' && Audio.isMuted();
    const cfg   = (UI_CONFIG.muteBtn || {})[muted ? 'off' : 'on'] || {};
    const label = cfg.text || I18n_t(muted ? 'btnSoundOff' : 'btnSoundOn');
    _applyToElement(btn, { ...cfg, text: label });

    const elCfg = (UI_CONFIG.elements || {})['#settingsMuteBtn'];
    if (elCfg && elCfg.style) Object.assign(btn.style, elCfg.style);
}

function updateDarkBtnUI(btn) {
    if (!btn) return;
    const dark  = typeof Theme !== 'undefined' && Theme.isDark();
    const cfg   = (UI_CONFIG.darkBtn || {})[dark ? 'off' : 'on'] || {};
    const label = cfg.text !== undefined && cfg.text !== null
        ? cfg.text
        : I18n_t(dark ? 'btnDarkOff' : 'btnDarkOn');
    _applyToElement(btn, { ...cfg, text: label });
}
