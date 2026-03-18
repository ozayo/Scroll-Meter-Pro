let totalPx = 0;
const DPI = 96;
const PX_TO_CM = 2.54 / DPI;
const sessionID = Date.now();
const currentDomain = window.location.hostname;

// Sadece bu domain için aktif mi kontrol et
chrome.storage.local.get({ activeDomains: [] }, (res) => {
    if (res.activeDomains.includes(currentDomain)) {
        initTracker();
    }
});

function initTracker() {
    const display = document.createElement('div');
    display.id = "scroll-meter-ui";
    display.style.cssText = "position:fixed; bottom:15px; left:15px; background:rgba(0,0,0,0.8); color:#0f0; padding:8px; border-radius:5px; z-index:999999; font-family:monospace; font-size:11px; pointer-events:none; border:1px solid #333;";
    document.body.appendChild(display);

    const updateUI = (delta) => {
        // SAYFA SONU KONTROLÜ
        const scrollPos = window.innerHeight + window.pageYOffset;
        const pageHeight = document.documentElement.scrollHeight;

        // Eğer kullanıcı en aşağıdaysa ve aşağı kaydırmaya çalışıyorsa (delta > 0), sayma.
        // Eğer en yukarıdaysa ve yukarı kaydırmaya çalışıyorsa (delta < 0), sayma.
        if (delta > 0 && scrollPos >= pageHeight - 2) return; 
        if (delta < 0 && window.pageYOffset <= 2) return;

        totalPx += Math.abs(delta);
        const cm = totalPx * PX_TO_CM;
        display.innerText = `REC: ${Math.round(totalPx)}px`;
        saveToStorage();
    };

    window.addEventListener('wheel', (e) => { 
        updateUI(e.deltaY); 
    }, { passive: true });
    
    let lastY = 0;
    window.addEventListener('touchstart', (e) => { lastY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
        let currentY = e.touches[0].clientY;
        let deltaY = lastY - currentY;
        updateUI(deltaY);
        lastY = currentY;
    }, { passive: true });
}

function saveToStorage() {
    chrome.storage.local.get({ history: [] }, (result) => {
        let history = result.history;
        const data = {
            sessionID,
            url: window.location.href,
            domain: currentDomain,
            screen: `${window.screen.width}x${window.screen.height}`,
            date: new Date().toLocaleString(),
            px: Math.round(totalPx),
            cm: (totalPx * PX_TO_CM).toFixed(2),
            m: (totalPx * PX_TO_CM / 100).toFixed(3)
        };
        const idx = history.findIndex(item => item.sessionID === sessionID);
        if (idx > -1) history[idx] = data;
        else history.push(data);
        chrome.storage.local.set({ history });
    });
}