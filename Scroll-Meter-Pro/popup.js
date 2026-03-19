document.addEventListener('DOMContentLoaded', async () => {
    const activeCheck = document.getElementById('active');
    const modeRadios = document.getElementsByName('mode');
    const historyList = document.getElementById('history-list');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) return;
    const currentDomain = new URL(tab.url).hostname;
    document.getElementById('domain-header').innerText = `${currentDomain} Kayıtları:`;

    chrome.storage.local.get({ activeDomains: [], mode: 'topToBottom' }, (data) => {
        activeCheck.checked = data.activeDomains.includes(currentDomain);
        const savedMode = data.mode || 'topToBottom';
        const targetRadio = document.querySelector(`input[name="mode"][value="${savedMode}"]`);
        if (targetRadio) targetRadio.checked = true;
    });

    const updateConfig = () => {
        const selectedMode = document.querySelector('input[name="mode"]:checked').value;
        chrome.storage.local.get({ activeDomains: [] }, (data) => {
            let domains = data.activeDomains;
            if (activeCheck.checked) {
                if (!domains.includes(currentDomain)) domains.push(currentDomain);
            } else {
                domains = domains.filter(d => d !== currentDomain);
            }
            chrome.storage.local.set({ activeDomains: domains, mode: selectedMode }, () => {
                chrome.tabs.reload(tab.id);
            });
        });
    };

    activeCheck.onchange = updateConfig;
    modeRadios.forEach(r => r.onchange = updateConfig);

    const renderHistory = () => {
        chrome.storage.local.get({ history: [] }, (data) => {
            const filtered = data.history.filter(item => item.domain === currentDomain);
            if (filtered.length === 0) {
                historyList.innerHTML = "<p style='font-size:11px; color:#999; padding:10px;'>Kayıt bulunamadı.</p>";
                return;
            }

            historyList.innerHTML = filtered.slice().reverse().map(item => `
                <div class="history-item" style="border-left:4px solid #007bff; padding:10px; margin-bottom:8px; background:white; position:relative; font-size:11px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <button class="delete-btn" data-id="${item.sessionID}" style="position:absolute; right:8px; top:8px; color:#dc3545; border:none; background:none; cursor:pointer; font-size:18px;">×</button>
                    <div style="font-weight:bold; margin-bottom:4px; word-break:break-all; padding-right:20px;">${item.url}</div>
                    <div style="color:#777; font-size:10px;">${item.date} | 🖥 ${item.screen}</div>
                    <div style="margin-top:6px; font-weight:bold;">
                        ${item.mode === 'all' ? `↕ Toplam: ${item.totalPx}px (↓${item.pxDown} ↑${item.pxUp})` : `↓ Aşağı: ${item.pxDown}px`}
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.onclick = function() {
                    const id = this.getAttribute('data-id');
                    chrome.storage.local.get({ history: [] }, (d) => {
                        const newH = d.history.filter(i => i.sessionID.toString() !== id.toString());
                        chrome.storage.local.set({ history: newH }, renderHistory);
                    });
                };
            });
        });
    };

    const exportData = (format) => {
        chrome.storage.local.get({ history: [] }, (data) => {
            const filtered = data.history.filter(item => item.domain === currentDomain);
            if (filtered.length === 0) return alert("Veri yok!");

            let blob, filename;
            if (format === 'json') {
                blob = new Blob([JSON.stringify({ [currentDomain]: filtered }, null, 2)], { type: 'application/json' });
                filename = `${currentDomain}_scroll_data.json`;
            } else {
                const headers = ["URL", "Tarih", "Mod", "Toplam_PX", "Asagi_PX", "Yukari_PX", "Ekran"];
                const rows = filtered.map(i => [`"${i.url}"`, i.date, i.mode, i.totalPx, i.pxDown, i.pxUp, i.screen]);
                const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
                blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                filename = `${currentDomain}_scroll_data.csv`;
            }
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        });
    };

    document.getElementById('btnCSV').onclick = () => exportData('csv');
    document.getElementById('btnJSON').onclick = () => exportData('json');
    renderHistory();
});