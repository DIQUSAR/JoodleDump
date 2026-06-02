const SDK = (() => {

    async function get() {
        try {
            return await window.yandexSDKPromise ?? null;
        } catch (_) {
            return null;
        }
    }

    async function call(fn) {
        const sdk = await get();
        if (!sdk) return;
        try {
            await fn(sdk);
        } catch (e) {
            console.warn('[SDK] call failed:', e);
        }
    }

    let _gameplayStarted = false;

    const Gameplay = {
        // GameplayAPI.stop() валиден только после хотя бы одного start().
        // Вызов stop() до start() игнорируется SDK и не меняет иконку GRA.
        start() {
            _gameplayStarted = true;
            return call(sdk => sdk.features.GameplayAPI?.start());
        },
        stop() {
            if (!_gameplayStarted) return Promise.resolve();
            return call(sdk => sdk.features.GameplayAPI?.stop());
        },
    };

    // Сигнал что игра готова к взаимодействию (п.1.19).
    // Если SDK ещё не resolve — вызов встанет в очередь и выполнится сразу после.
    // Если SDK уже resolve — выполнится в следующем микротаске.
    function notifyReady() {
        window.yandexSDKPromise.then(sdk => {
            sdk?.features?.LoadingAPI?.ready();
        });
    }

    let _payments = null;

    const Payments = {
        async init() {
            try {
                const sdk = await get();
                if (!sdk) return;
                _payments = await sdk.getPayments({ signed: true });
                console.info('[SDK.Payments] инициализирован');
            } catch (e) {
                console.warn('[SDK.Payments] init failed:', e);
            }
        },

        // возвращает { ok: true } | { ok: false, reason: string }
        async purchase(productId) {
            if (!_payments) return { ok: false, reason: 'unavailable' };
            try {
                const purchase = await _payments.purchase({ id: productId });
                return { ok: true, purchase };
            } catch (e) {
                // пользователь закрыл окно — не ошибка
                const reason = e?.code === 'USER_CLOSED' ? 'cancelled' : 'error';
                console.warn('[SDK.Payments] purchase failed:', e);
                return { ok: false, reason };
            }
        },

        // возвращает массив id купленных товаров
        async restore() {
            if (!_payments) return [];
            try {
                const list = await _payments.getPurchases();
                return list.map(p => p.productID);
            } catch (e) {
                console.warn('[SDK.Payments] restore failed:', e);
                return [];
            }
        },
    };

    return { get, call, Gameplay, notifyReady, Payments };
})();
