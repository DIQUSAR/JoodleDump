// ПАССИВНЫЕ НАВЫКИ
// ─────────────────────────────────────────────────────────────────
// Хранит уровни прокачки всех пассивных навыков.
// Персистентность: localStorage('dj_passives').
//
// Добавить новый пассив:
//   1. Добавить запись в PASSIVE_DEFS
//   2. Добавить метод-геттер бонуса ниже (пример: getSpawnBonus)
//   3. Использовать геттер там где нужен бонус
// ─────────────────────────────────────────────────────────────────

const PASSIVE_DEFS = {
    diamondFever: {
        id:          'diamondFever',
        labelKey:    'passiveFeverLabel',
        descKey:     'passiveFeverDesc',
        icon:        '💎',
        maxLevel:    80,
        baseCost:    3,
        costStep:    3,
        bonusPerLvl: 0.002,   // +0.2% шанс спавна алмаза за уровень
    },
    doubleDiamond: {
        id:          'doubleDiamond',
        labelKey:    'passiveDoubleLabel',
        descKey:     'passiveDoubleDesc',
        icon:        '✨',
        maxLevel:    80,
        baseCost:    5,
        costStep:    5,
        bonusPerLvl: 0.001,   // +0.1% шанс x2 алмаза за уровень
    },
    superJump: {
        id:          'superJump',
        labelKey:    'passiveSuperJumpLabel',
        descKey:     'passiveSuperJumpDesc',
        icon:        '🌀',
        maxLevel:    80,
        baseCost:    3,
        costStep:    3,
        bonusPerLvl: 0.002,   // +0.2% шанс суперпрыжка за уровень
    },
};

const Passives = (() => {

    const _KEY = 'dj_passives';

    // Читаем сохранённые уровни из localStorage
    let _levels = (() => {
        try {
            const raw = JSON.parse(localStorage.getItem(_KEY) || '{}');
            return typeof raw === 'object' && raw !== null ? raw : {};
        } catch (_) { return {}; }
    })();

    function _save() {
        try { localStorage.setItem(_KEY, JSON.stringify(_levels)); } catch (_) {}
    }

    // Текущий уровень навыка
    function getLevel(id) {
        return Math.min(_levels[id] || 0, PASSIVE_DEFS[id]?.maxLevel || 0);
    }

    // Стоимость следующего уровня
    function getNextCost(id) {
        const def  = PASSIVE_DEFS[id];
        if (!def) return Infinity;
        const next = getLevel(id) + 1;
        if (next > def.maxLevel) return Infinity;
        return def.baseCost + (next - 1) * def.costStep;
        // Уровень 1 → baseCost = 3
        // Уровень 2 → 3 + 1*3 = 6
        // Уровень 3 → 3 + 2*3 = 9 ...
    }

    // Попытка прокачать. Возвращает true если успешно.
    function upgrade(id) {
        const def  = PASSIVE_DEFS[id];
        if (!def) return false;
        const lvl  = getLevel(id);
        if (lvl >= def.maxLevel) return false;
        const cost = getNextCost(id);
        if (!Currency.spend(cost)) return false;
        _levels[id] = lvl + 1;
        _save();
        // Сохраняем прогресс в облако (debounce внутри YandexSync)
        if (typeof YandexSync !== 'undefined') YandexSync.save();
        return true;
    }

    // Геттеры бонусов

    // Бонус к шансу спавна алмаза (0.0 .. 0.16 при maxLevel=80)
    function getSpawnBonus() {
        const def = PASSIVE_DEFS.diamondFever;
        return getLevel('diamondFever') * def.bonusPerLvl;
    }

    // Шанс получить x2 алмаза при сборе (0.0 .. 0.08 при maxLevel=80)
    function getDoubleChance() {
        const def = PASSIVE_DEFS.doubleDiamond;
        return getLevel('doubleDiamond') * def.bonusPerLvl;
    }

    // Шанс суперпрыжка x1.5 высоты (0.0 .. 0.16 при maxLevel=80)
    function getSuperJumpChance() {
        const def = PASSIVE_DEFS.superJump;
        return getLevel('superJump') * def.bonusPerLvl;
    }

    // Синхронизация

    // Возвращает копию объекта уровней (для облачного сохранения)
    function getAllLevels() {
        return { ..._levels };
    }

    // Берёт максимум из облака и локального (не даёт потерять прогресс)
    function mergeLevels(cloudLevels) {
        if (typeof cloudLevels !== 'object' || cloudLevels === null) return;
        Object.entries(cloudLevels).forEach(([id, lvl]) => {
            if (typeof lvl !== 'number') return;
            const def = PASSIVE_DEFS[id];
            if (!def) return;
            const clamped = Math.min(Math.max(0, lvl), def.maxLevel);
            if (clamped > (getLevel(id))) {
                _levels[id] = clamped;
            }
        });
        _save();
    }

    return { getLevel, getNextCost, upgrade, getSpawnBonus, getDoubleChance, getSuperJumpChance, getAllLevels, mergeLevels, DEFS: PASSIVE_DEFS };
})();
