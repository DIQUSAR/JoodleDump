// МОДУЛЬ РЕКЛАМЫ — Яндекс SDK
const Adv = (() => {

    // Минимальный интервал между fullscreen рекламой на нашей стороне (мс).
    const FULLSCREEN_COOLDOWN_MS = 60_000; // 60 секунд

    let _lastFullscreenAt = 0; // timestamp последнего показа


    // Полноэкранная реклама
    async function showFullscreen({ onClose } = {}) {
        const sdk = await SDK.get();
        if (!sdk) {
            onClose?.(false);
            return;
        }

        // Guard: не показываем чаще чем раз в COOLDOWN
        const now = Date.now();
        if (now - _lastFullscreenAt < FULLSCREEN_COOLDOWN_MS) {
            console.info('[Adv] Fullscreen cooldown, пропускаем');
            onClose?.(false);
            return;
        }

        // Звук глушим до показа рекламы
        Audio.systemPause();

        sdk.adv.showFullscreenAdv({
            callbacks: {
                onOpen: () => {
                    console.info('[Adv] Fullscreen открыта');
                },
                onClose: (wasShown) => {
                    _lastFullscreenAt = Date.now();
                    Audio.systemResume();
                    console.info('[Adv] Fullscreen закрыта, wasShown:', wasShown);
                    onClose?.(wasShown);
                },
                onError: (err) => {
                    Audio.systemResume();
                    console.warn('[Adv] Fullscreen ошибка:', err);
                    onClose?.(false);
                },
            },
        });
    }

    // Rewarded video
    // Вызывать: по явному запросу игрока
    // onRewarded вызывается ТОЛЬКО если игрок досмотрел до конца
    async function showRewarded({ onRewarded, onClose } = {}) {
        const sdk = await SDK.get();
        if (!sdk) {
            onClose?.(false);
            return;
        }

        Audio.systemPause();

        sdk.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => {
                    console.info('[Adv] Rewarded открыта');
                },
                onRewarded: () => {
                    console.info('[Adv] Награда выдана');
                    onRewarded?.();
                },
                onClose: (wasShown) => {
                    Audio.systemResume();
                    console.info('[Adv] Rewarded закрыта, wasShown:', wasShown);
                    onClose?.(wasShown);
                },
                onError: (err) => {
                    Audio.systemResume();
                    console.warn('[Adv] Rewarded ошибка:', err);
                    onClose?.(false);
                },
            },
        });
    }

    // Sticky баннер
    // Управляется через Консоль разработчика
    async function showBanner() {
        const sdk = await SDK.get();
        if (!sdk) return;
        try { await sdk.adv.showBannerAdv(); } catch (_) {}
    }

    async function hideBanner() {
        const sdk = await SDK.get();
        if (!sdk) return;
        try { await sdk.adv.hideBannerAdv(); } catch (_) {}
    }

    return { showFullscreen, showRewarded, showBanner, hideBanner };
})();
