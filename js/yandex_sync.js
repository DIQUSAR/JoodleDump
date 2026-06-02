// синхронизация с яндекс sdk

const YandexSync = (() => {

    const CLOUD_KEY  = 'joodle_save_v1';
    const SAVE_DELAY = 3000;

    let _player      = null;
    let _saveTimer   = null;
    let _initialized = false;

    async function _getPlayer() {
        if (_player) return _player;
        try {
            const sdk = await SDK.get();
            if (!sdk) return null;
            _player = await sdk.getPlayer({ scopes: false });
            return _player;
        } catch (e) {
            console.warn('[YandexSync] getPlayer failed:', e);
            return null;
        }
    }

    function _collect() {
        return {
            diamonds:      Currency.get(),
            ownedSkins:    [...Shop.getOwnedSkins()],
            roboAdCount:   Shop.getAdCount(),
            currentSkin:   activeSkin,
            passiveLevels: Passives.getAllLevels(),
            activeState:   Actives.getAllState(),
            highScore:     GameState.highScore,
            savedAt:       Date.now(),
        };
    }

    async function _doSave() {
        const player = await _getPlayer();
        if (!player) return;
        try {
            await player.setData({ [CLOUD_KEY]: _collect() }, true);
            console.info('[YandexSync] Сохранено в облако');
        } catch (e) {
            console.warn('[YandexSync] setData failed:', e);
        }
    }

    function _saveLocal() {
        try {
            localStorage.setItem('dj_diamonds',       Currency.get());
            localStorage.setItem('dj_highscore',      GameState.highScore);
            localStorage.setItem('dj_passive_levels', JSON.stringify(Passives.getAllLevels()));
            localStorage.setItem('dj_owned_skins',    JSON.stringify([...Shop.getOwnedSkins()]));
            localStorage.setItem('dj_skin',           activeSkin);
        } catch (_) {}
    }

    function save() {
        _saveLocal();
        if (!_initialized) return;
        clearTimeout(_saveTimer);
        _saveTimer = setTimeout(_doSave, SAVE_DELAY);
    }

    function saveNow() {
        _saveLocal();
        if (!_initialized) return;
        clearTimeout(_saveTimer);
        _doSave();
    }

    function _applyCloudData(cloud) {
        if (typeof cloud.diamonds === 'number' && cloud.diamonds > Currency.get()) {
            Currency.set(cloud.diamonds);
        }

        if (Array.isArray(cloud.ownedSkins)) {
            Shop.mergeOwned(cloud.ownedSkins);
        Shop.mergeAdCount(cloud.roboAdCount);
        }

        if (
            typeof cloud.currentSkin === 'string' &&
            typeof SKINS !== 'undefined' && SKINS[cloud.currentSkin] &&
            Shop.isOwned(cloud.currentSkin)
        ) {
            activeSkin = cloud.currentSkin;
            try { localStorage.setItem('dj_skin', activeSkin); } catch (_) {}
        }

        if (cloud.passiveLevels && typeof cloud.passiveLevels === 'object') {
            Passives.mergeLevels(cloud.passiveLevels);
        }

        if (cloud.activeState && typeof cloud.activeState === 'object') {
            Actives.mergeState(cloud.activeState);
        }

        if (typeof cloud.highScore === 'number' && cloud.highScore > GameState.highScore) {
            GameState.highScore = cloud.highScore;
            try { localStorage.setItem('dj_highscore', GameState.highScore); } catch (_) {}
        }
    }

    async function init() {
        // инициализируем платежи параллельно с получением профиля
        SDK.Payments.init();

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
                console.info('[YandexSync] Облачных данных нет, записываем текущие');
                await _doSave();
            }
        } catch (e) {
            console.warn('[YandexSync] getData failed:', e);
        }

        _initialized = true;

        // восстанавливаем покупки из яндекс payments (на случай смены устройства)
        SDK.Payments.restore().then(productIds => {
            const iapToSkin = { skin_fashion: 'dood_fashion', skin_mafia: 'dood_mafia' };
            const toGrant = productIds.map(pid => iapToSkin[pid]).filter(Boolean);
            if (toGrant.length > 0) {
                Shop.mergeOwned(toGrant);
                save();
            }
        });

        Currency.onChange(() => save());
        window.addEventListener('pagehide', saveNow);
        window.addEventListener('beforeunload', saveNow);
        console.info('[YandexSync] Инициализирован');
    }

    return { init, save, saveNow };
})();
