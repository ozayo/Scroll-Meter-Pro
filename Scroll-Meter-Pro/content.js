let totalPx = 0;
const DPI = 96;
const PX_TO_CM = 2.54 / DPI;
const sessionID = Date.now();

// Default olarak kapalı (false) kontrolü
chrome.storage.sync.get({ active: false }, (res) => {
    if (res.active) initTracker();
});

function initTracker() {
    const display = document.createElement('div');
    display.id = "scroll-meter-ui";
    display.style.cssText = "position:fixed; bottom:15px; left:15px; background:rgba(0,0,0,0.8); color:#0f0; padding:8px; border-radius:5px; z-index:999999; font-family:monospace; font-size:11px; pointer-events:none; border:1px solid #333;";
    document.body.appendChild(display);

    const updateUI = () => {
        const cm = totalPx * PX_TO_CM;
        display.innerText = `REC: ${Math.round(totalPx)}px`;
        saveToStorage();
    };

    window.addEventListener('wheel', (e) => { totalPx += Math.abs(e.deltaY); updateUI(); }, { passive: true });
    
    let lastY = 0;
    window.addEventListener('touchstart', (e) => { lastY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
        let currentY = e.touches[0].clientY;
        totalPx += Math.abs(lastY - currentY);
        lastY = currentY;
        updateUI();
    }, { passive: true });
}

function saveToStorage() {
    chrome.storage.local.get({ history: [] }, (result) => {
        let history = result.history;
        const data = {
            sessionID,
            url: window.location.href, // Tam URL
            domain: window.location.hostname, // Ana Domain
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