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

    return { get, call, Gameplay, notifyReady };
})();
