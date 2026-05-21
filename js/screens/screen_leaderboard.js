// экран лидерборда

function showLeaderboard() {
    drawMenuBackground();
    overlay.innerHTML = `
        <div class="shop-wrap">
            <div class="shop-header">
                <button id="btnLBBack" class="shop-back-btn">✕</button>
                <h2 id="lbTitle" style="font-family:inherit;font-size:26px;margin:0;">${I18n.t('lbTitle')}</h2>
                <div style="width:34px;"></div>
            </div>
            <div id="lbContainer" style="width:100%;max-width:320px;min-height:120px;padding:0 16px;overflow-y:auto;"></div>
        </div>
    `;
    document.getElementById('btnLBBack').addEventListener('click', showMenu);
    Leaderboard.showTopEntries(document.getElementById('lbContainer'), 10);
    applyUIConfig(overlay);
}
