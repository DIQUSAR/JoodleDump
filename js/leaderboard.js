// ЛИДЕРБОРД ЯНДЕКС ИГР
// Техническое название: yndxhighscore
//
// Что делает этот модуль:
//   1. setScore(score)     — отправляет результат если он лучше предыдущего
//   2. getPlayerEntry()    — получает личный рекорд игрока из лидерборда
//   3. showTopEntries()    — рисует таблицу топ-игроков в overlay
//   4. syncHighScore()     — при старте подтягивает рекорд с сервера в локальный highScore

const Leaderboard = (() => {

    // Техническое название лидерборда — менять только здесь
    const LB_NAME = 'yndxhighscore';

    // Защищает от двойной отправки при быстром нажатии кнопок
    let _submittedThisRound = false;

    // Вспомогательная: получить SDK или null
    async function _sdk() {
        try {
            const sdk = await SDK.get();
            return sdk || null;
        } catch (_) { return null; }
    }

    // Проверить авторизацию
    // Возвращает true если пользователь залогинен
    async function _isAuthorized(sdk) {
        try {
            const player = await sdk.getPlayer({ scopes: false });
            // mode 'lite' = не авторизован
            return player.getMode() !== 'lite';
        } catch (_) { return false; }
    }

    // Показать диалог входа
    async function _promptAuth(sdk) {
        try {
            await sdk.auth.openAuthDialog();
            return true;
        } catch (_) { return false; }
    }

    // Отправить результат
    // Вызывать из showGameOver() ПОСЛЕ обновления highScore
    // score — итоговый счёт этой партии
    async function setScore(score) {
        if (score <= 0) return;
        if (_submittedThisRound) return; // guard от двойной отправки
        _submittedThisRound = true;

        const sdk = await _sdk();
        if (!sdk) return;

        // Проверяем доступность метода
        const available = await sdk.isAvailableMethod('leaderboards.setScore');
        if (!available) {
            console.warn('[LB] leaderboards.setScore недоступен');
            return;
        }

        // Если не авторизован предлагаем войти
        const authed = await _isAuthorized(sdk);
        if (!authed) {
            const loggedIn = await _promptAuth(sdk);
            if (!loggedIn) return; // отказался — не отправляем
        }

        try {
            // SDK сам сравнивает с предыдущим результатом и сохраняет только лучший
            await sdk.leaderboards.setScore(LB_NAME, score);
            console.info('[LB] Результат отправлен:', score);
        } catch (err) {
            // Не фатально — игра продолжается без лидерборда
            console.warn('[LB] Ошибка отправки результата:', err);
        }
    }

    // Сбросить флаг — вызывать при startGame()
    function resetRound() {
        _submittedThisRound = false;
    }

    // Подтянуть рекорд с сервера в локальный highScore
    // Вызывается один раз при инициализации игры
    // Если сервер вернул больше локального обновляем
    async function syncHighScore() {
        const sdk = await _sdk();
        if (!sdk) return;

        const available = await sdk.isAvailableMethod('leaderboards.getPlayerEntry');
        if (!available) return;

        const authed = await _isAuthorized(sdk);
        if (!authed) return; // для неавторизованных синхронизация недоступна

        try {
            const entry = await sdk.leaderboards.getPlayerEntry(LB_NAME);
            if (entry && entry.score > highScore) {
                highScore = entry.score;
                try { localStorage.setItem('dj_highscore', highScore); } catch (_) {}
                // Обновить строку рекорда в меню без перерисовки всего overlay
                if (typeof updateMenuRecord === 'function') updateMenuRecord();
                console.info('[LB] Рекорд подтянут с сервера:', highScore);
            }
        } catch (err) {
            // Ошибка "Пользователь скрыт" или нет записи - норма, не падаем
            console.warn('[LB] getPlayerEntry:', err);
        }
    }

    // Получить и показать топ лидерборда
    // container - DOM-элемент куда рисовать таблицу
    // topCount  - сколько топ-игроков показать
    async function showTopEntries(container, topCount = 5) {
        if (!container) return;

        container.innerHTML = `<p style="text-align:center;opacity:.5;">${I18n.t('lbLoading')}</p>`;

        const sdk = await _sdk();
        if (!sdk) {
            container.innerHTML = `<p style="text-align:center;opacity:.5;">${I18n.t('lbUnavailable')}</p>`;
            return;
        }

        const authed = await _isAuthorized(sdk);
        if (!authed) {
            container.innerHTML = `<p style="text-align:center;opacity:.5;">${I18n.t('lbAuthRequired')}</p>`;
            return;
        }

        try {
            const data = await sdk.leaderboards.getEntries(LB_NAME, {
                includeUser:    true,  // включить строку с текущим игроком
                quantityAround: 2,     // ±2 соседа вокруг игрока
                quantityTop:    topCount,
            });

            if (!data.entries || data.entries.length === 0) {
                container.innerHTML = `<p style="text-align:center;opacity:.5;">${I18n.t('lbEmpty')}</p>`;
                return;
            }

            // Рисуем таблицу
            const rows = data.entries.map(entry => {
                const name      = entry.player.publicName || I18n.t('lbAnon');
                const isCurrent = data.userRank && entry.rank === data.userRank;
                return `
                    <tr class="${isCurrent ? 'lb-me' : ''}">
                        <td class="lb-rank">${entry.rank}</td>
                        <td class="lb-name">${name}</td>
                        <td class="lb-score">${entry.score}</td>
                    </tr>
                `;
            }).join('');

            container.innerHTML = `
                <table class="lb-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>${I18n.t('lbPlayer')}</th>
                            <th>${I18n.t('lbScore')}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        } catch (err) {
            console.warn('[LB] getEntries:', err);
            container.innerHTML = `<p style="text-align:center;opacity:.5;">${I18n.t('lbError')}</p>`;
        }
    }

    return { setScore, resetRound, syncHighScore, showTopEntries };
})();
