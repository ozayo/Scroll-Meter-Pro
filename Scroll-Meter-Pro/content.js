let downPx = 0, upPx = 0;
const sessionID = Date.now();
let config = { active: false, mode: 'topToBottom' };

chrome.storage.local.get({ activeDomains: [], mode: 'topToBottom' }, (res) => {
    config.mode = res.mode;
    if (res.activeDomains.includes(window.location.hostname)) initTracker();
});

function initTracker() {
    const display = document.createElement('div');
    display.id = "scroll-meter-ui";
    display.style.cssText = "position:fixed; bottom:15px; left:15px; background:rgba(0,0,0,0.9); color:#fff; padding:12px; border-radius:10px; z-index:999999; font-family:monospace; border:1px solid #444; display:flex; align-items:center; gap:12px; box-shadow: 0 4px 15px rgba(0,0,0,0.6);";
    document.body.appendChild(display);

    const updateUI = (delta) => {
        const scrollPos = window.innerHeight + window.pageYOffset;
        const pageHeight = document.documentElement.scrollHeight;

        // Sayfa sonu ve başı sınırı (Boşa dönen tekerleği saymaz)
        if (delta > 0 && scrollPos >= pageHeight - 5) return;
        if (delta < 0 && window.pageYOffset <= 5) return;

        if (delta > 0) {
            downPx += Math.abs(delta);
        } else if (delta < 0 && config.mode === 'all') {
            upPx += Math.abs(delta);
        }

        renderHUD();
        saveToStorage();
    };

    function renderHUD() {
        let statsHTML = config.mode === 'topToBottom' 
            ? `<span>↓ ${Math.round(downPx)}px</span>`
            : `<div style="display:flex; flex-direction:column; font-size:10px;">
                <span style="border-bottom:1px solid #555; padding-bottom:2px; margin-bottom:2px;">↕ Toplam: ${Math.round(downPx + upPx)}px</span>
                <span>↓ ${Math.round(downPx)} | ↑ ${Math.round(upPx)}</span>
              </div>`;
        
        display.innerHTML = `
            ${statsHTML}
            <button id="go-to-top" title="Sayfa Başına Dön" style="background:#444; border:none; color:white; cursor:pointer; padding:4px 8px; border-radius:4px; font-size:14px; margin-left:5px;">⤒</button>
        `;

        document.getElementById('go-to-top').onclick = (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    window.addEventListener('wheel', (e) => updateUI(e.deltaY), { passive: true });
    
    let lastY = 0;
    window.addEventListener('touchstart', (e) => { lastY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
        let currentY = e.touches[0].clientY;
        updateUI(lastY - currentY);
        lastY = currentY;
    }, { passive: true });

    renderHUD();
}

function saveToStorage() {
    chrome.storage.local.get({ history: [] }, (result) => {
        const data = {
            sessionID, 
            url: window.location.href, 
            domain: window.location.hostname,
            date: new Date().toLocaleString(), 
            screen: `${window.screen.width}x${window.screen.height}`,
            pxDown: Math.round(downPx), 
            pxUp: Math.round(upPx), 
            totalPx: Math.round(downPx + upPx),
            mode: config.mode
        };
        let history = result.history;
        const idx = history.findIndex(item => item.sessionID === sessionID);
        if (idx > -1) history[idx] = data; else history.push(data);
        chrome.storage.local.set({ history });
    });
}