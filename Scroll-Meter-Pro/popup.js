document.addEventListener('DOMContentLoaded', async () => {
    const activeCheck = document.getElementById('active');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentDomain = new URL(tab.url).hostname;

    // Aktif domainler listesini kontrol et
    chrome.storage.local.get({ activeDomains: [] }, (data) => {
        activeCheck.checked = data.activeDomains.includes(currentDomain);
    });

    activeCheck.onchange = () => {
        chrome.storage.local.get({ activeDomains: [] }, (data) => {
            let domains = data.activeDomains;
            if (activeCheck.checked) {
                if (!domains.includes(currentDomain)) domains.push(currentDomain);
            } else {
                domains = domains.filter(d => d !== currentDomain);
            }
            chrome.storage.local.set({ activeDomains: domains }, () => {
                chrome.tabs.reload(tab.id); // Sadece o sekmeyi yenile
            });
        });
    };

    const renderHistory = () => {
        chrome.storage.local.get({ history: [] }, (data) => {
            const filtered = data.history.filter(item => item.domain === currentDomain);
            
            if (filtered.length === 0) {
                historyList.innerHTML = "<p style='font-size:11px; color:#999;'>Kayıt bulunamadı.</p>";
                return;
            }

            historyList.innerHTML = filtered.reverse().map(item => `
                <div class="history-item">
                    <button class="delete-btn" data-id="${item.sessionID}">×</button>
                    <span class="url-text">${item.url}</span>
                    <div style="color:#888">${item.date} | ${item.screen}</div>
                    <div style="font-weight:bold; margin-top:3px;">${item.px} px | ${item.cm} cm | ${item.m} m</div>
                </div>
            `).join('');

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.onclick = (e) => deleteItem(e.target.getAttribute('data-id'));
            });
        });
    };

    const deleteItem = (id) => {
        chrome.storage.local.get({ history: [] }, (data) => {
            const newHistory = data.history.filter(item => item.sessionID.toString() !== id.toString());
            chrome.storage.local.set({ history: newHistory }, renderHistory);
        });
    };

    // Export Fonksiyonu
    const exportData = (type) => {
        chrome.storage.local.get({ history: [] }, (data) => {
            const filtered = data.history.filter(item => item.domain === currentDomain);
            if (filtered.length === 0) return alert("İndirilecek veri yok!");

            let content = "";
            if (type === 'csv' || type === 'xls') {
                const headers = ["URL", "Tarih", "Ekran", "Pixel", "CM", "Metre"];
                const rows = filtered.map(i => [i.url, i.date, i.screen, i.px, i.cm, i.m]);
                content = [headers, ...rows].map(e => e.join(",")).join("\n");
            }

            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${currentDomain}_scroll_data.${type === 'xls' ? 'xls' : 'csv'}`;
            link.click();
        });
    };

    document.getElementById('btnCSV').onclick = () => exportData('csv');
    document.getElementById('btnXLS').onclick = () => exportData('xls');

    renderHistory();
});