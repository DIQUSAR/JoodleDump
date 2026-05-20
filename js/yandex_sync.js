// СИНХРОНИЗАЦИЯ С ЯНДЕКС SDK
// Отвечает за облачное сохранение прогресса игрока через
// Яндекс Player API (player.getData / player.setData).
//
// Данные в облаке хранятся под одним ключом CLOUD_KEY в виде:
//   {
//     diamonds: number,
//     ownedSkins: string[],
//     currentSkin: string,
//     passiveLevels: { [id]: number },
//     highScore: number,
//     savedAt: number  // timestamp — для отладки
//   }
//
// Стратегия слияния: берём МАКСИМУМ из локального и облачного.
// Это защищает от потери прогресса при игре на нескольких устройствах.
//
// Автосохранение: debounce 3 сек. — вызывается через Currency.onChange
// и напрямую из Passives.upgrade / Shop при изменении скинов.

const YandexSync = (() => {

    const CLOUD_KEY    = 'joodle_save_v1';
    const SAVE_DELAY   = 3000; // debounce задержка в мс

    let _player        = null; // кэш объекта player из SDK
    let _saveTimer     = null;
    let _initialized   = false;

    // SDK Player

    async function _getPlayer() {
        if (_player) return _player;
        try {
            const sdk = await SDK.get();
            if (!sdk) return null;
            // scopes: false — не требуем разрешений (анонимный игрок тоже сохраняет)
            _player = await sdk.getPlayer({ scopes: false });
            return _player;
        } catch (e) {
            console.warn('[YandexSync] getPlayer failed:', e);
            return null;
        }
    }

    // Сбор текущего состояния игры

    function _collect() {
        return {
            diamonds:     Currency.get(),
            ownedSkins:   [...Shop.getOwnedSkins()],
            currentSkin:  activeSkin,
            passiveLevels: Passives.getAllLevels(),
            activeState:   Actives.getAllState(),
            highScore:    highScore,
            savedAt:      Date.now(),
        };
    }

    // Сохранение в облако

    async function _doSave() {
        const player = await _getPlayer();
        if (!player) return;
        try {
            const payload = { [CLOUD_KEY]: _collect() };
            // flush: true — немедленная запись без буферизации SDK
            await player.setData(payload, true);
            console.info('[YandexSync] Сохранено в облако');
        } catch (e) {
            console.warn('[YandexSync] setData failed:', e);
        }
    }

    // Публичный метод сохранения с debounce.
    // Всегда пишет в localStorage как fallback, затем в облако.
    function save() {
        // localStorage — синхронный fallback, работает всегда
        _saveLocal();
        // Облако — только после инициализации SDK
        if (!_initialized) return;
        clearTimeout(_saveTimer);
        _saveTimer = setTimeout(_doSave, SAVE_DELAY);
    }

    // Немедленное сохранение (без debounce) для критичных моментов
    function saveNow() {
        _saveLocal();
        if (!_initialized) return;
        clearTimeout(_saveTimer);
        _doSave();
    }

    // Синхронная запись ключевых данных в localStorage как резервная копия
    function _saveLocal() {
        try {
            localStorage.setItem('dj_diamonds', Currency.get());
            localStorage.setItem('dj_highscore', highScore);
            localStorage.setItem('dj_passive_levels', JSON.stringify(Passives.getAllLevels()));
            localStorage.setItem('dj_owned_skins', JSON.stringify([...Shop.getOwnedSkins()]));
            localStorage.setItem('dj_skin', activeSkin);
        } catch (_) {}
    }

    // Загрузка и применение облачных данных

    function _applyCloudData(cloud) {
        // 1. Алмазы — берём максимум
        if (typeof cloud.diamonds === 'number' && cloud.diamonds > Currency.get()) {
            Currency.set(cloud.diamonds);
            console.info('[YandexSync] Алмазы из облака:', cloud.diamonds);
        }

        // 2. Купленные скины — объединяем (union)
        if (Array.isArray(cloud.ownedSkins)) {
            Shop.mergeOwned(cloud.ownedSkins);
        }

        // 3. Активный скин — применяем если он существует и разблокирован
        if (
            typeof cloud.currentSkin === 'string' &&
            typeof SKINS !== 'undefined' && SKINS[cloud.currentSkin] &&
            Shop.isOwned(cloud.currentSkin)
        ) {
            activeSkin = cloud.currentSkin;
            try { localStorage.setItem('dj_skin', activeSkin); } catch (_) {}
        }

        // 4. Уровни пассивов — берём максимум для каждого навыка
        if (cloud.passiveLevels && typeof cloud.passiveLevels === 'object') {
            Passives.mergeLevels(cloud.passiveLevels);
        }

        // 5. Активные бусты — восстанавливаем таймеры
        if (cloud.activeState && typeof cloud.activeState === 'object') {
            Actives.mergeState(cloud.activeState);
        }

        // 6. Рекорд — берём максимум
        if (typeof cloud.highScore === 'number' && cloud.highScore > highScore) {
            highScore = cloud.highScore;
            try { localStorage.setItem('dj_highscore', highScore); } catch (_) {}
            console.info('[YandexSync] Рекорд из облака:', highScore);
        }
    }

    // Инициализация

    async function init() {
        const player = await _getPlayer();
        if (!player) {
            console.info('[YandexSync] SDK недоступен, работаем без облака');
            return;
        }

        try {
            const data  = await player.getData([CLOUD_KEY]);
            const cloud = data?.[CLOUD_KEY];

            if (cloud && typeof cloud === 'object') {
                _applyCloudData(cloud);
            } else {
                // Первый запуск на этом аккаунте — сразу сохраняем
                console.info('[YandexSync] Облачных данных нет, записываем текущие');
                await _doSave();
            }
        } catch (e) {
            console.warn('[YandexSync] getData failed:', e);
        }

        _initialized = true;

        // Подписываемся на изменение баланса — автосохранение
        Currency.onChange(() => save());

        // Сохраняем при уходе со страницы (best-effort)
        window.addEventListener('pagehide', saveNow);
        window.addEventListener('beforeunload', saveNow);

        console.info('[YandexSync] Инициализирован');
    }

    return { init, save, saveNow };
})();
