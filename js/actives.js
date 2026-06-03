// АКТИВНЫЕ БУСТЫ
// ─────────────────────────────────────────────────────────────────
// ACTIVE_DEFS — единственное место для настройки бустов.
//
// Иконка (поле icon):
//   '🔥'                                    — emoji
//   '<img src="img/fever.png" style="font-size:28px">' — своя картинка
//
// Иконка кнопки рекламы (поле adIcon):
//   '📺'                                    — emoji
//   '<img src="img/ad.png" style="width:20px;height:20px;vertical-align:middle">'
//
// durationSec / cooldownSec — секунды, меняй под свои нужды.
// ─────────────────────────────────────────────────────────────────

const ACTIVE_DEFS = {

    diamondFeverBoost: {
        id:           'diamondFeverBoost',
        labelKey:     'activeFeverLabel',
        descKey:      'activeFeverDesc',
        icon:         '<img src="img/diamond_chance_x3.png" style="width:28px;height:28px;vertical-align:middle">',       // иконка карточки
        costDiamonds: 50,
        durationSec:  5  * 60, // 5 минут
        cooldownSec:  5  * 60, // 5 минут кд
        multiplier:   3, // Во сколько раз увеличить шанс
    },

    doubleStrikeBoost: {
        id:           'doubleStrikeBoost',
        labelKey:     'activeDoubleLabel',
        descKey:      'activeDoubleDesc',
        icon:         '<img src="img/diamond_double_x3.png" style="width:28px;height:28px;vertical-align:middle">',
        costDiamonds: 100,
        durationSec:  5  * 60, // 5 минут
        cooldownSec:  5  * 60, // 5 минут кд
        multiplier:   3, // Во сколько раз увеличить шанс
    },

    superJumpBoost: {
        id:           'superJumpBoost',
        labelKey:     'activeSuperJumpLabel',
        descKey:      'activeSuperJumpDesc',
        icon:         '<img src="img/jump_boost_x3.png" style="width:28px;height:28px;vertical-align:middle">',
        costDiamonds: 30,
        durationSec:  5  * 60, // 5 минут
        cooldownSec:  5 * 60, // 5 минут кд
        multiplier:   3, // Во сколько раз увеличить шанс
    },
};

const Actives = (() => {

    const _KEY = 'dj_actives';

    let _state = (() => {
        try {
            const raw = JSON.parse(localStorage.getItem(_KEY) || '{}');
            return typeof raw === 'object' && raw !== null ? raw : {};
        } catch (_) { return {}; }
    })();

    function _save() {
        try { localStorage.setItem(_KEY, JSON.stringify(_state)); } catch (_) {}
        if (typeof YandexSync !== 'undefined') YandexSync.save();
    }

    function _now() { return Date.now(); }

    // Запросы состояния

    function isActive(id) {
        return !!(_state[id] && _state[id].endsAt > _now());
    }

    function isOnCooldown(id) {
        if (isActive(id)) return false;
        return !!(_state[id] && _state[id].cooldownEndsAt > _now());
    }

    function getRemainingMs(id) {
        return isActive(id) ? Math.max(0, _state[id].endsAt - _now()) : 0;
    }

    function getCooldownMs(id) {
        return isOnCooldown(id) ? Math.max(0, _state[id].cooldownEndsAt - _now()) : 0;
    }

    // Активация

    function _activate(id) {
        const def = ACTIVE_DEFS[id];
        if (!def) return false;
        const now = _now();
        _state[id] = {
            endsAt:         now + def.durationSec * 1000,
            cooldownEndsAt: now + def.durationSec * 1000 + def.cooldownSec * 1000,
        };
        _save();
        return true;
    }

    // Возвращает: 'ok' | 'cooldown' | 'already_active' | 'no_funds' | 'error'
    function activateForDiamonds(id) {
        const def = ACTIVE_DEFS[id];
        if (!def)             return 'error';
        if (isActive(id))     return 'already_active';
        if (isOnCooldown(id)) return 'cooldown';
        if (def.costDiamonds !== null && !Currency.spend(def.costDiamonds)) return 'no_funds';
        _activate(id);
        return 'ok';
    }

    // Вызывать только внутри onRewarded — алмазы не тратит
    function activateForAd(id) {
        const def = ACTIVE_DEFS[id];
        if (!def)             return 'error';
        if (isActive(id))     return 'already_active';
        if (isOnCooldown(id)) return 'cooldown';
        _activate(id);
        return 'ok';
    }

    // Геттеры эффектов

    // x3 к шансу спавна алмаза
    function getDiamondMultiplier() {
        if (!isActive('diamondFeverBoost')) return 1;
        return ACTIVE_DEFS.diamondFeverBoost.multiplier;
    }

    // x3 к шансу двойного алмаза
    function getDoubleMultiplier() {
        if (!isActive('doubleStrikeBoost')) return 1;
        return ACTIVE_DEFS.doubleStrikeBoost.multiplier;
    }

    // x3 к шансу суперпрыжка
    function getSuperJumpMultiplier() {
        if (!isActive('superJumpBoost')) return 1;
        return ACTIVE_DEFS.superJumpBoost.multiplier;
    }

    // Синхронизация

    function getAllState() { return JSON.parse(JSON.stringify(_state)); }

    function mergeState(cloudState) {
        if (typeof cloudState !== 'object' || !cloudState) return;
        Object.entries(cloudState).forEach(([id, s]) => {
            if (!ACTIVE_DEFS[id]) return;
            if (!_state[id] || (s.endsAt > _now() && s.endsAt > (_state[id]?.endsAt || 0))) {
                _state[id] = s;
            }
        });
        _save();
    }

    return {
        DEFS: ACTIVE_DEFS,
        isActive, isOnCooldown, getRemainingMs, getCooldownMs,
        activateForDiamonds, activateForAd,
        getDiamondMultiplier, getDoubleMultiplier, getSuperJumpMultiplier,
        getAllState, mergeState,
    };
})();
