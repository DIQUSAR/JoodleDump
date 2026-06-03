// МАГАЗИН
// Архитектура: один объект Shop с двумя вкладками — skins / boosts.
// Скины читаются напрямую из SKINS (player.js) — данные не дублируются.
// Выбранный скин сохраняется в localStorage ('dj_skin').
// Купленные скины сохраняются в localStorage ('dj_owned_skins').

const Shop = (() => {

    let _activeTab     = 'skins'; // 'skins' | 'boosts'
    let _timerInterval = null;    // live-таймер для активных бустов

    // Мета-данные скинов для магазина
    const SKIN_META = {
        dood:         { labelKey: 'skinDood',    price: null },
        dood_blue:    { labelKey: 'skinBlue',    price: 500   },
        dood_red:     { labelKey: 'skinRed',     price: 1000  },
        dood_gold:    { labelKey: 'skinGold',    price: 2500  },
        dood_diamond: { labelKey: 'skinDiamond', price: 5000  },
        dood_ruby:    { labelKey: 'skinRuby',    price: 10000  },
        dood_robo:    { labelKey: 'skinRobo',    price: null, adTarget: 100, perks: [{cls:'perk-diamond',text:'+1'}] },
        dood_fashion: { labelKey: 'skinFashion', price: null, iap: 'skin_fashion', yanPrice: 25, perks: [{cls:'perk-diamond',text:'+3'},{cls:'perk-score',text:'×2'}] },
        dood_mafia:   { labelKey: 'skinMafia',   price: null, iap: 'skin_mafia',   yanPrice: 50, perks: [{cls:'perk-diamond',text:'+5'},{cls:'perk-score',text:'×3'}] },
    };

    // Активные бусты рендерятся из Actives.DEFS

    // Купленные скины: Set из id. Читается из localStorage, dood всегда включён.
    const _owned = (() => {
        try {
            const saved = JSON.parse(localStorage.getItem('dj_owned_skins') || '[]');
            return new Set(Array.isArray(saved) ? saved : []);
        } catch (_) { return new Set(); }
    })();
    _owned.add('dood');

    const AD_SKIN_KEY = 'dj_robo_ad';
    const AD_SKIN_ID  = 'dood_robo';
    let _adCount = (() => {
        try { return Math.min(parseInt(localStorage.getItem(AD_SKIN_KEY), 10) || 0,
            SKIN_META.dood_robo?.adTarget || 100); } catch (_) { return 0; }
    })();

    function _saveAdCount() {
        try { localStorage.setItem(AD_SKIN_KEY, _adCount); } catch (_) {}
    }

    function onAdWatched() {
        if (isOwned(AD_SKIN_ID)) return;
        const meta = SKIN_META[AD_SKIN_ID];
        if (!meta?.adTarget) return;
        _adCount = Math.min(_adCount + 1, meta.adTarget);
        _saveAdCount();
        if (_adCount >= meta.adTarget) {
            _owned.add(AD_SKIN_ID);
            _saveOwned();
            if (typeof YandexSync !== 'undefined') YandexSync.save();
        }
        const badge = document.querySelector(`[data-skin='${AD_SKIN_ID}'] .shop-badge`);
        if (badge) {
            const label = `${_adCount}/${meta.adTarget}`;
            badge.className = 'shop-badge price shop-badge--ad';
            badge.setAttribute('data-ad-badge', '');
            badge.textContent = label;
            applyUIConfig(badge.closest('.shop-card') ?? badge);
        }
    }

    function _saveOwned() {
        try { localStorage.setItem('dj_owned_skins', JSON.stringify([..._owned])); } catch (_) {}
    }

    function isOwned(id) { return _owned.has(id); }

    function getOwnedSkins() { return new Set(_owned); }
    function mergeOwned(arr) {
        if (!Array.isArray(arr)) return;
        arr.forEach(id => _owned.add(id));
        _saveOwned();
    }

    // ── Форматирование времени ────────────────────────────────────
    // Вынесено на уровень модуля — не пересоздаётся при каждом рендере
    function _fmtTime(ms) {
        const totalSec = Math.ceil(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return m > 0
            ? `${m} ${I18n.t('activeMin')} ${s} ${I18n.t('activeSec')}`
            : `${s} ${I18n.t('activeSec')}`;
    }

    // ── Live-таймер активных бустов ───────────────────────────────
    // Обновляет только текст в [data-active-timer] раз в секунду.
    // При смене состояния (active→cooldown, cooldown→ready) делает
    // полный _render() чтобы показать/скрыть кнопки корректно.
    // Самоостанавливается если магазин закрыт или открыта вкладка скинов.

    function _stopLiveTimer() {
        if (_timerInterval !== null) {
            clearInterval(_timerInterval);
            _timerInterval = null;
        }
    }

    function _startLiveTimer() {
        _stopLiveTimer();

        // Снимок состояний для обнаружения переходов
        const _prev = {};
        Object.keys(Actives.DEFS).forEach(id => {
            _prev[id] = Actives.isActive(id) ? 'active'
                      : Actives.isOnCooldown(id) ? 'cooldown' : 'ready';
        });

        _timerInterval = setInterval(() => {
            // Самоостановка если магазин закрыт или переключились на скины
            if (overlay.style.display !== 'flex' || _activeTab !== 'boosts') {
                _stopLiveTimer();
                return;
            }

            // Проверяем переходы состояний
            let needsFullRender = false;
            Object.keys(Actives.DEFS).forEach(id => {
                const curr = Actives.isActive(id) ? 'active'
                           : Actives.isOnCooldown(id) ? 'cooldown' : 'ready';
                if (curr !== _prev[id]) {
                    needsFullRender = true;
                    _prev[id] = curr;
                }
            });

            if (needsFullRender) {
                _render(); // _render() сам вызовет _startLiveTimer()
                return;
            }

            // Точечное обновление текста — без перестройки DOM
            Object.values(Actives.DEFS).forEach(def => {
                const el = document.querySelector(`[data-active-timer="${def.id}"]`);
                if (!el) return;
                if (Actives.isActive(def.id)) {
                    el.textContent = `${I18n.t('activeActive')}: ${_fmtTime(Actives.getRemainingMs(def.id))}`;
                } else if (Actives.isOnCooldown(def.id)) {
                    el.textContent = `${I18n.t('activeCooldown')}: ${_fmtTime(Actives.getCooldownMs(def.id))}`;
                }
            });
        }, 1000);
    }

    // ── Публичный API ─────────────────────────────────────────────

    function show() {
        drawMenuBackground();
        overlay.style.display = 'flex';
        _render();
    }

    function _render() {
        _stopLiveTimer();
        overlay.innerHTML = _buildHTML();
        _bindEvents();
        applyUIConfig(overlay);
        if (_activeTab === 'boosts') _startLiveTimer();
    }

    function _buildHTML() {
        const bal = Currency.get();
        return `
            <div class="shop-wrap">
                <div class="shop-header">
                    <button id="shopBack" class="shop-back-btn">✕</button>
                    <h2 class="shop-title"> ${I18n.t('shopTitle')}</h2>
                    <div class="shop-header-right">
                        <button id="shopAdBtn" class="shop-ad-btn">+50${DIAMOND_CFG.uiIcon}</button>
                        <div class="shop-balance">${DIAMOND_CFG.uiIcon} ${bal}</div>
                    </div>
                </div>

                <div class="shop-tabs">
                    <button class="shop-tab${_activeTab === 'skins'  ? ' active' : ''}" data-tab="skins" >${I18n.t('tabSkins')}</button>
                    <button class="shop-tab${_activeTab === 'boosts' ? ' active' : ''}" data-tab="boosts">${I18n.t('tabBoosts')}</button>
                </div>

                <div class="shop-content">
                    ${_activeTab === 'skins' ? _buildSkins() : _buildBoosts()}
                </div>
            </div>
        `;
    }

    function _buildSkins() {
        return Object.entries(SKIN_META).map(([id, meta]) => {
            const isActive = activeSkin === id;
            const owned    = isOwned(id);
            const skinDef  = SKINS[id];
            const imgSrc   = skinDef ? skinDef.src : '';

            let badge;
            if (isActive) {
                badge = `<span class="shop-badge active">${I18n.t('skinActive')}</span>`;
            } else if (owned) {
                badge = `<span class="shop-badge owned">${I18n.t('skinSelect')}</span>`;
            } else if (meta.iap) {
                badge = `<span class="shop-badge price" data-iap-badge>${meta.yanPrice} ${I18n.t('yanUnit')}</span>`;
            } else if (meta.adTarget) {
                const goal  = meta.adTarget;
                const label = `${_adCount}/${goal}`;
                badge = `<span class="shop-badge price shop-badge--ad" data-ad-badge>${label}</span>`;
            } else {
                badge = `<span class="shop-badge price"><img src="img/diamond.png" style="width:12px;height:12px;vertical-align:middle"> ${meta.price}</span>`;
            }

            return `
                <div class="shop-card${isActive ? ' selected' : ''}${!owned ? ' shop-locked' : ''}" data-skin="${id}">
                    <div class="shop-card-preview">
                        <img src="${imgSrc}" alt="${I18n.t(meta.labelKey)}" draggable="false"${!owned ? ' style="opacity:0.35;filter:grayscale(1)"' : ''}>
                        ${!owned ? '<div class="shop-lock-icon" data-lock-icon>🔒</div>' : ''}
                    </div>
                    <div class="shop-card-label">${I18n.t(meta.labelKey)}</div>
                    <div class="shop-card-status">${badge}</div>
                    ${meta.perks ? `<div class="shop-card-perk">${meta.perks.map(p=>`<span class="${p.cls}"></span>${p.text}`).join('  ')}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    function _buildBoosts() {
        return `
            <div class="boost-section-title">${I18n.t('passivePassive')}</div>
            ${_buildPassives()}
            <div class="boost-section-title boost-section-title--active">${I18n.t('passiveActive')}</div>
            ${_buildActives()}
        `;
    }

    function _buildActives() {
        return Object.values(Actives.DEFS).map(def => {
            const isActive   = Actives.isActive(def.id);
            const onCooldown = Actives.isOnCooldown(def.id);
            const remMs      = Actives.getRemainingMs(def.id);
            const cdMs       = Actives.getCooldownMs(def.id);

            // data-active-timer — целевой атрибут для точечного обновления текста
            let statusBlock = '';
            if (isActive) {
                statusBlock = `
                    <div class="active-status active-status--on"
                         data-active-timer="${def.id}">
                        ${I18n.t('activeActive')}: ${_fmtTime(remMs)}
                    </div>`;
            } else if (onCooldown) {
                statusBlock = `
                    <div class="active-status active-status--cd"
                         data-active-timer="${def.id}">
                        ${I18n.t('activeCooldown')}: ${_fmtTime(cdMs)}
                    </div>`;
            }

            const canActivate = !isActive && !onCooldown;
            const btnBlock = canActivate ? `
                <div class="active-btn-row">
                    <button class="boost-upgrade-btn active-buy-btn" data-active="${def.id}">
                        ${I18n.t('activeActivate')}<br>
                        <span class="boost-upgrade-cost">${DIAMOND_CFG.uiIcon} ${def.costDiamonds}</span>
                    </button>
                    <button class="active-ad-btn" data-active="${def.id}">
                        ${I18n.t('activeWatchAd')}
                    </button>
                </div>` : '';

            return `
                <div class="boost-passive-card" data-active="${def.id}">
                    <div class="boost-passive-icon${isActive ? ' boost-passive-icon--active' : ''}">${def.icon}</div>
                    <div class="boost-passive-body">
                        <div class="boost-passive-name">${I18n.t(def.labelKey)}</div>
                        <div class="boost-passive-desc">${I18n.t(def.descKey)}</div>
                        ${statusBlock}
                        ${btnBlock}
                    </div>
                </div>
            `;
        }).join('');
    }

    function _buildPassives() {
        return Object.values(Passives.DEFS).map(def => {
            const lvl    = Passives.getLevel(def.id);
            const maxLvl = def.maxLevel;
            const isMax  = lvl >= maxLvl;
            const cost   = isMax ? null : Passives.getNextCost(def.id);
            const bonus  = (lvl * def.bonusPerLvl * 100).toFixed(1);
            const pct    = Math.round((lvl / maxLvl) * 100);

            let upgradeBlock;
            if (isMax) {
                upgradeBlock = `<span class="shop-badge active">${I18n.t('passiveMaxLevel')}</span>`;
            } else {
                upgradeBlock = `
                    <button class="boost-upgrade-btn" data-passive="${def.id}">
                        ${I18n.t('passiveUpgrade')}<br>
                        <span class="boost-upgrade-cost">${DIAMOND_CFG.uiIcon} ${cost}</span>
                    </button>
                `;
            }

            return `
                <div class="boost-passive-card" data-passive="${def.id}">
                    <div class="boost-passive-icon">${def.icon}</div>
                    <div class="boost-passive-body">
                        <div class="boost-passive-name">${I18n.t(def.labelKey)}</div>
                        <div class="boost-passive-desc">${I18n.t(def.descKey)}</div>
                        <div class="boost-passive-bonus">+${bonus}%</div>
                        <div class="boost-passive-bar-wrap">
                            <div class="boost-passive-bar" style="width:${pct}%"></div>
                        </div>
                        <div class="boost-passive-level">
                            ${I18n.t('passiveLevel')} ${lvl} / ${maxLvl}
                        </div>
                    </div>
                    <div class="boost-passive-upgrade">
                        ${upgradeBlock}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ── События ───────────────────────────────────────────────────

    function _bindEvents() {
        document.getElementById('shopBack')
            .addEventListener('click', () => {
                _stopLiveTimer();
                showMenu();
            });

        document.getElementById('shopAdBtn')
            .addEventListener('click', () => {
                const btn = document.getElementById('shopAdBtn');
                btn.disabled = true;
                Adv.showRewarded({
                    onRewarded: () => { Currency.add(50); onAdWatched(); },
                    onClose:    () => { _render(); },
                });
            });

        document.querySelectorAll('.shop-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                _activeTab = btn.dataset.tab;
                _render();
            });
        });

        // Активные бусты — купить за алмазы
        document.querySelectorAll('.active-buy-btn[data-active]').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const id     = btn.dataset.active;
                const result = Actives.activateForDiamonds(id);
                if (result === 'no_funds' || result === 'cooldown' || result === 'already_active') {
                    const card = btn.closest('.boost-passive-card');
                    card.classList.add('shake');
                    card.addEventListener('animationend',
                        function h() { this.classList.remove('shake'); this.removeEventListener('animationend', h); });
                }
                _render();
            });
        });

        // Активные бусты — смотреть рекламу
        document.querySelectorAll('.active-ad-btn[data-active]').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const id = btn.dataset.active;
                btn.disabled = true;
                Adv.showRewarded({
                    onRewarded: () => { Actives.activateForAd(id); onAdWatched(); },
                    onClose:    () => { _render(); },
                });
            });
        });

        // Пассивные навыки — прокачать
        document.querySelectorAll('.boost-upgrade-btn[data-passive]').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const id = btn.dataset.passive;
                if (!Passives.upgrade(id)) {
                    const card = btn.closest('.boost-passive-card');
                    card.classList.add('shake');
                    card.addEventListener('animationend',
                        function h() { this.classList.remove('shake'); this.removeEventListener('animationend', h); });
                    return;
                }
                _render();
            });
        });

        // Скины
        document.querySelectorAll('.shop-card[data-skin]').forEach(card => {
            card.addEventListener('click', () => {
                const id   = card.dataset.skin;
                const meta = SKIN_META[id];
                if (!meta) return;

                if (isOwned(id)) {
                    if (activeSkin === id) return;
                    activeSkin = id;
                    try { localStorage.setItem('dj_skin', id); } catch (_) {}
                    if (typeof YandexSync !== 'undefined') YandexSync.save();
                    _render();
                    return;
                }

                if (meta.adTarget) {
                    card.style.pointerEvents = 'none';
                    Adv.showRewarded({
                        onRewarded: () => { onAdWatched(); },
                        onClose:    () => {
                            card.style.pointerEvents = '';
                            _render();
                        },
                    });
                    return;
                }

                if (meta.iap) {
                    card.style.pointerEvents = 'none';
                    SDK.Payments.purchase(meta.iap).then(result => {
                        card.style.pointerEvents = '';
                        Audio.systemResume();
                        if (!result.ok) {
                            if (result.reason !== 'cancelled') {
                                card.classList.add('shake');
                                card.addEventListener('animationend', () => card.classList.remove('shake'), { once: true });
                            }
                            return;
                        }
                        _owned.add(id);
                        _saveOwned();
                        activeSkin = id;
                        try { localStorage.setItem('dj_skin', id); } catch (_) {}
                        if (typeof YandexSync !== 'undefined') YandexSync.save();
                        _render();
                    });
                    return;
                }

                if (!Currency.spend(meta.price)) {
                    card.classList.add('shake');
                    card.addEventListener('animationend', () => card.classList.remove('shake'), { once: true });
                    return;
                }
                _owned.add(id);
                _saveOwned();
                activeSkin = id;
                try { localStorage.setItem('dj_skin', id); } catch (_) {}
                if (typeof YandexSync !== 'undefined') YandexSync.save();
                _render();
            });
        });
    }

    function getAdCount() { return _adCount; }
    function mergeAdCount(cloud) {
        if (typeof cloud === 'number' && cloud > _adCount) {
            _adCount = cloud;
            _saveAdCount();
            if (_adCount >= (SKIN_META[AD_SKIN_ID]?.adTarget || Infinity) && !isOwned(AD_SKIN_ID)) {
                _owned.add(AD_SKIN_ID);
                _saveOwned();
            }
        }
    }

    return { show, isOwned, getOwnedSkins, mergeOwned, onAdWatched, getAdCount, mergeAdCount };
})();
