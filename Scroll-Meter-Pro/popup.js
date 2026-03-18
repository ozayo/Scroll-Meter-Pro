document.addEventListener('DOMContentLoaded', async () => {
    const activeCheck = document.getElementById('active');
    const historyList = document.getElementById('history-list');
    const domainHeader = document.getElementById('domain-header');

    // 1. Mevcut sekmenin bilgilerini al
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return;
    
    const currentDomain = new URL(tab.url).hostname;
    domainHeader.innerText = `${currentDomain} Kayıtları:`;

    // 2. Bu domain için eklenti aktif mi? (Ayar yükleme)
    chrome.storage.local.get({ activeDomains: [] }, (data) => {
        activeCheck.checked = data.activeDomains.includes(currentDomain);
    });

    // 3. Aktifleştir/Devre Dışı Bırak Butonu
    activeCheck.onchange = () => {
        chrome.storage.local.get({ activeDomains: [] }, (data) => {
            let domains = data.activeDomains;
            if (activeCheck.checked) {
                if (!domains.includes(currentDomain)) domains.push(currentDomain);
            } else {
                domains = domains.filter(d => d !== currentDomain);
            }
            chrome.storage.local.set({ activeDomains: domains }, () => {
                chrome.tabs.reload(tab.id); // Ayar değişince sayfayı yenile
            });
        });
    };

    // 4. Geçmiş Kayıtları Listele (Render Function)
    const renderHistory = () => {
        chrome.storage.local.get({ history: [] }, (data) => {
            // Filtreleme: Sadece mevcut domain'e ait olanları getir
            const filtered = data.history.filter(item => item.domain === currentDomain);
            
            if (filtered.length === 0) {
                historyList.innerHTML = "<p style='font-size:11px; color:#999; padding:10px;'>Bu site için henüz kayıt bulunamadı.</p>";
                return;
            }

            // Listeyi tarihe göre (en yeni en üstte) sırala ve ekrana bas
            historyList.innerHTML = filtered.slice().reverse().map(item => `
                <div class="history-item" style="border-left: 4px solid #007bff; margin-bottom: 8px; padding: 10px; background: white; border-radius: 4px; position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <button class="delete-btn" data-id="${item.sessionID}" style="position: absolute; right: 8px; top: 8px; cursor: pointer; color: #dc3545; border: none; background: none; font-size: 16px;">×</button>
                    <span class="url-text" style="color: #555; font-weight: bold; font-size: 11px; display: block; margin-bottom: 4px; word-break: break-all;">${item.url}</span>
                    <div style="color:#888; font-size: 10px;">${item.date} | ${item.screen}</div>
                    <div style="font-weight:bold; margin-top:3px; font-size: 11px;">${item.px} px | ${item.cm} cm | ${item.m} m</div>
                </div>
            `).join('');

            // Silme butonlarını bağla
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const idToDelete = e.target.getAttribute('data-id');
                    deleteItem(idToDelete);
                };
            });
        });
    };

    // 5. Kayıt Silme Fonksiyonu
    const deleteItem = (id) => {
        chrome.storage.local.get({ history: [] }, (data) => {
            const newHistory = data.history.filter(item => item.sessionID.toString() !== id.toString());
            chrome.storage.local.set({ history: newHistory }, () => {
                renderHistory(); // Listeyi güncelle
            });
        });
    };

    // 6. Export Fonksiyonları (CSV / Excel)
    const exportData = (type) => {
        chrome.storage.local.get({ history: [] }, (data) => {
            const filtered = data.history.filter(item => item.domain === currentDomain);
            if (filtered.length === 0) return alert("İndirilecek veri yok!");

            const headers = ["URL", "Tarih", "Ekran", "Pixel", "CM", "Metre"];
            const rows = filtered.map(i => [i.url, i.date, i.screen, i.px, i.cm, i.m]);
            const content = [headers, ...rows].map(e => e.join(",")).join("\n");

            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${currentDomain}_scroll_data.${type === 'xls' ? 'xls' : 'csv'}`;
            link.click();
        });
    };

    document.getElementById('btnCSV').onclick = () => exportData('csv');
    document.getElementById('btnXLS').onclick = () => exportData('xls');

    // Sayfa açıldığında listeyi yükle
    renderHistory();
});