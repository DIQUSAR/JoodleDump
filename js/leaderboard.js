// лидерборд яндекс игр

const Leaderboard = (() => {

    const LB_NAME = 'yndxhighscore';

    let _submittedThisRound = false;

    async function _sdk() {
        try { return await SDK.get() || null; }
        catch (_) { return null; }
    }

    async function _isAuthorized(sdk) {
        try {
            const player = await sdk.getPlayer({ scopes: false });
            return player.getMode() !== 'lite';
        } catch (_) { return false; }
    }

    async function _promptAuth(sdk) {
        try { await sdk.auth.openAuthDialog(); return true; }
        catch (_) { return false; }
    }

    async function setScore(score) {
        if (score <= 0 || _submittedThisRound) return;
        _submittedThisRound = true;

        const sdk = await _sdk();
        if (!sdk) return;

        const available = await sdk.isAvailableMethod('leaderboards.setScore');
        if (!available) { console.warn('[LB] leaderboards.setScore недоступен'); return; }

        const authed = await _isAuthorized(sdk);
        if (!authed) {
            const loggedIn = await _promptAuth(sdk);
            if (!loggedIn) return;
        }

        try {
            await sdk.leaderboards.setScore(LB_NAME, score);
            console.info('[LB] Результат отправлен:', score);
        } catch (err) {
            console.warn('[LB] Ошибка отправки результата:', err);
        }
    }

    function resetRound() {
        _submittedThisRound = false;
    }

    async function syncHighScore() {
        const sdk = await _sdk();
        if (!sdk) return;

        const available = await sdk.isAvailableMethod('leaderboards.getPlayerEntry');
        if (!available) return;

        const authed = await _isAuthorized(sdk);
        if (!authed) return;

        try {
            const entry = await sdk.leaderboards.getPlayerEntry(LB_NAME);
            if (entry && entry.score > GameState.highScore) {
                GameState.highScore = entry.score;
                try { localStorage.setItem('dj_highscore', GameState.highScore); } catch (_) {}
                if (typeof updateMenuRecord === 'function') updateMenuRecord();
                console.info('[LB] Рекорд подтянут с сервера:', GameState.highScore);
            }
        } catch (err) {
            console.warn('[LB] getPlayerEntry:', err);
        }
    }

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
                includeUser:    true,
                quantityAround: 2,
                quantityTop:    topCount,
            });

            if (!data.entries || data.entries.length === 0) {
                container.innerHTML = `<p style="text-align:center;opacity:.5;">${I18n.t('lbEmpty')}</p>`;
                return;
            }

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
