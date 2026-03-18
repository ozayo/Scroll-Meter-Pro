# 🚀 Scroll Meter Pro

**Scroll Meter Pro** is a high-precision Google Chrome extension designed to measure the **actual physical effort** spent scrolling on modern websites. 

Unlike standard trackers that only measure the page's vertical height, this tool captures every "scroll" signal—including interactions on **Parallax**, **Scroll-jacking**, and **GSAP-heavy** sites where the page might stay visually static while content transforms.

---

## ✨ Key Features

- **Advanced Animation Tracking:** Uses `wheel` and `touchmove` event listeners to capture movement even when the page doesn't technically "scroll" (perfect for Apple-style product pages).
- **Physical Metrics:** Converts digital pixels into **Centimeters (cm)** and **Meters (m)** in real-time.
- **Hierarchical Tracking:** - Displays the **Root Domain** at the top.
  - Lists individual records for **Full URLs** (e.g., `/about-us`, `/pricing`) underneath.
- **Session Intelligence:** Logs the **Screen Resolution** and **Timestamp** for every session to provide context for your data.
- **Privacy Controlled:** - **Disabled by default.** You decide when to start tracking via the popup toggle.
  - Each record can be individually deleted using the trash icon.
- **Data Export:** Download your browsing effort for any specific domain as **CSV** or **Excel** files.

---

## 🛠 Installation (Developer Mode)

Since this is a custom extension, follow these steps to install it:

1. **Clone or Download** this repository to your local machine.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **"Developer Mode"** in the top-right corner.
4. Click **"Load unpacked"** and select the folder (Scroll-Meter-Pro) containing these files.
5. (Optional) Pin the **Scroll Meter Pro** icon to your toolbar for quick access.

---

## 🚀 How to Use

1. Click the extension icon and check **"Enable Scroll Meter"**. (The page will reload to initiate tracking).
2. A small **HUD (Heads-Up Display)** will appear in the bottom-left corner showing your live pixel count.
3. Once you're done, click the icon again to view your history for that specific domain.
4. Use the **Download** buttons at the bottom of the popup to export your data for further analysis.

---

## 📊 The Science Behind the Measurement

The extension uses standard display logic to bridge the gap between digital and physical distance:

$$1 \text{ inch} = 2.54 \text{ cm}$$
$$96 \text{ px (Standard DPI)} = 2.54 \text{ cm}$$
$$1 \text{ px} \approx 0.0264 \text{ cm}$$

> **Note:** While 96 DPI is the industry standard for calculation, the physical result may vary slightly depending on your monitor's actual pixel density (PPI).

---

## 📂 File Structure

- `manifest.json`: Configuration, permissions, and metadata.
- `content.js`: The core engine that runs on web pages to capture input events.
- `popup.html`: The user interface for settings and data visualization.
- `popup.js`: Logic for filtering domain-specific data, deleting records, and exporting files.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

### 🛣 Roadmap
- [ ] **Global Dashboard:** View total "distance traveled" across all websites in a single view.
- [ ] **Speedometer:** Measure your average scroll velocity.
- [ ] **Visual Heatmaps:** See which parts of a page required the most scrolling effort.