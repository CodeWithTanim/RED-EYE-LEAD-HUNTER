<p align="center">
  <img src="public/banner.png" alt="RED EYE Banner" width="75%">
</p>

<h1 align="center">👁️ RED EYE LEAD HUNTER</h1>

<p align="center">
  <strong>A high-performance, dark-themed Chrome Extension for automated lead extraction from Google Maps.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-red?style=for-the-badge&logo=googlechrome" alt="Manifest V3">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React 18">
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite" alt="Vite 5">
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
</p>

---

## 📖 Overview

**RED EYE** is a sophisticated lead generation tool designed for outreach specialists, marketing agencies, and sales professionals. It automates the tedious process of harvesting business contact information from Google Maps, transforming raw search results into structured, actionable CSV data.

Unlike generic scrapers, RED EYE is built with a "Deep Scrape" engine that navigates into individual business profiles to extract elusive data points like emails and social media links, all while maintaining a polite, human-like interaction pattern.

---

## ✨ Key Features

- 🚀 **Automated Extraction**: Smart auto-scrolling with randomized delays (1.2s – 2.6s) to mimic human behavior.
- 🧠 **Deep Scrape Engine**: Programmatically interacts with side panels to harvest emails, social links (IG/FB), and WhatsApp numbers.
- 📞 **Smart WhatsApp Fallback**: Intelligently constructs `wa.me` links from localized phone numbers when direct links are missing.
- 🧹 **Zero-Noise Data**: Automatic deduplication based on unique Name + Address pairs.
- 📥 **One-Click Export**: Downloads UTF‑8 BOM encoded CSVs, ensuring perfect compatibility with Microsoft Excel.
- 🎯 **Advanced Filtering**: Instantly isolate businesses without websites — a goldmine for web design and SEO agencies.
- 🎨 **Premium UI/UX**: Features a draggable, dark-themed cyberpunk interface injected directly into the Google Maps DOM.

---

## 🛠️ Technical Stack

### Browser Extension
- **Engine**: Vanilla JavaScript (ES6+)
- **Standard**: Chrome Manifest V3
- **State Management**: `chrome.storage.local` for persistence across sessions.
- **Messaging**: Asynchronous message passing between Content Scripts and Background Service Workers.

### Landing Page & Dashboard
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite 5
- **Styling**: Tailwind CSS & shadcn/ui
- **Icons**: Lucide React

---

## 🧠 Technical Challenges & Solutions

### 1. Handling Dynamic DOM Virtualization
**Challenge**: Google Maps uses aggressive DOM virtualization, meaning elements are destroyed and recreated as you scroll.
**Solution**: Implemented a robust `MutationObserver` and custom polling logic to ensure the scraper consistently finds data even when the browser recycles DOM nodes.

### 2. Rate Limiting & Bot Detection
**Challenge**: Scraping too fast triggers CAPTCHAs or temporary blocks.
**Solution**: Developed a randomized delay algorithm and localized interaction points to simulate natural human scrolling and clicking patterns.

### 3. Data Normalization
**Challenge**: Business details vary wildly in format (e.g., phone numbers, addresses).
**Solution**: Used regular expressions and string parsing logic to clean and standardize fields like `Country`, `City`, and `WhatsApp` links for reliable outreach use.

---

## 📁 Project Structure

```bash
RED-EYE-LEAD-HUNTER
├── 📁 extension
│   ├── 📁 icons
│   │   └── 🖼️ icon.png
│   ├── 📄 background.js
│   ├── 📄 content.js
│   ├── ⚙️ manifest.json
│   ├── 🌐 popup.html
│   ├── 📄 popup.js
│   └── 🎨 styles.css
├── 📁 public
│   ├── 🖼️ banner.png
│   ├── 🖼️ favicon.png
│   ├── 📦 red-eye.zip
│   ├── 🖼️ placeholder.svg
│   └── 📄 robots.txt
├── 📁 src
│   ├── 📁 assets
│   │   └── 🖼️ red-eye-logo.png
│   ├── 📁 components
│   │   ├── 📁 ui
│   │   │   ├── 📄 accordion.tsx
│   │   │   ├── 📄 alert-dialog.tsx
│   │   │   ├── 📄 alert.tsx
│   │   │   ├── 📄 aspect-ratio.tsx
│   │   │   ├── 📄 avatar.tsx
│   │   │   ├── 📄 badge.tsx
│   │   │   ├── 📄 breadcrumb.tsx
│   │   │   ├── 📄 button.tsx
│   │   │   ├── 📄 calendar.tsx
│   │   │   ├── 📄 card.tsx
│   │   │   ├── 📄 carousel.tsx
│   │   │   ├── 📄 chart.tsx
│   │   │   ├── 📄 checkbox.tsx
│   │   │   ├── 📄 collapsible.tsx
│   │   │   ├── 📄 command.tsx
│   │   │   ├── 📄 context-menu.tsx
│   │   │   ├── 📄 dialog.tsx
│   │   │   ├── 📄 drawer.tsx
│   │   │   ├── 📄 dropdown-menu.tsx
│   │   │   ├── 📄 form.tsx
│   │   │   ├── 📄 hover-card.tsx
│   │   │   ├── 📄 input-otp.tsx
│   │   │   ├── 📄 input.tsx
│   │   │   ├── 📄 label.tsx
│   │   │   ├── 📄 menubar.tsx
│   │   │   ├── 📄 navigation-menu.tsx
│   │   │   ├── 📄 pagination.tsx
│   │   │   ├── 📄 popover.tsx
│   │   │   ├── 📄 progress.tsx
│   │   │   ├── 📄 radio-group.tsx
│   │   │   ├── 📄 resizable.tsx
│   │   │   ├── 📄 scroll-area.tsx
│   │   │   ├── 📄 select.tsx
│   │   │   ├── 📄 separator.tsx
│   │   │   ├── 📄 sheet.tsx
│   │   │   ├── 📄 sidebar.tsx
│   │   │   ├── 📄 skeleton.tsx
│   │   │   ├── 📄 slider.tsx
│   │   │   ├── 📄 sonner.tsx
│   │   │   ├── 📄 switch.tsx
│   │   │   ├── 📄 table.tsx
│   │   │   ├── 📄 tabs.tsx
│   │   │   ├── 📄 textarea.tsx
│   │   │   ├── 📄 toast.tsx
│   │   │   ├── 📄 toaster.tsx
│   │   │   ├── 📄 toggle-group.tsx
│   │   │   ├── 📄 toggle.tsx
│   │   │   ├── 📄 tooltip.tsx
│   │   │   └── 📄 use-toast.ts
│   │   └── 📄 NavLink.tsx
│   ├── 📁 hooks
│   │   ├── 📄 use-mobile.tsx
│   │   └── 📄 use-toast.ts
│   ├── 📁 lib
│   │   └── 📄 utils.ts
│   ├── 📁 pages
│   │   ├── 📄 Index.tsx
│   │   └── 📄 NotFound.tsx
│   ├── 📁 test
│   │   ├── 📄 example.test.ts
│   │   └── 📄 setup.ts
│   ├── 🎨 App.css
│   ├── 📄 App.tsx
│   ├── 🎨 index.css
│   ├── 📄 main.tsx
│   └── 📄 vite-env.d.ts
├── ⚙️ .gitignore
├── 📝 HOST.md
├── 📝 README.md
├── 📄 bun.lockb
├── ⚙️ components.json
├── 📄 eslint.config.js
├── 🌐 index.html
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 postcss.config.js
├── 📄 tailwind.config.ts
├── ⚙️ tsconfig.app.json
├── ⚙️ tsconfig.json
├── ⚙️ tsconfig.node.json
├── 📄 vite.config.ts
└── 📄 vitest.config.ts
```

---

## 🚀 Installation (Developer Mode)

1.  Download the latest **`red-eye.zip`** from the landing page.
2.  Extract the archive to a local folder.
3.  Navigate to `chrome://extensions` in your browser.
4.  Enable **"Developer mode"** in the top-right corner.
5.  Click **"Load unpacked"** and select the `extension/` folder or the extracted directory.

---

## 🧑‍💻 Usage

1.  Visit [Google Maps](https://www.google.com/maps).
2.  Search for a niche (e.g., *"Web Design in New York"*).
3.  The **RED EYE** panel will appear on the right.
4.  Toggle **Deep Scrape** for full contact harvesting.
5.  Press **Start** and watch your lead list grow in real-time.
6.  Click **Export CSV** when you're ready to start your campaign.

---

## 👨‍💻 Meet the Developer

**MD SAMIUR RAHMAN TANIM**  
*Developed by Vibe Coding for Time Save using Lovable*

<p align="left">
  <a href="https://github.com/CodeWithTanim"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="https://linkedin.com/in/codewithtanim"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://youtube.com/@CodeWithTanim"><img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube"></a>
  <a href="https://facebook.com/CodeWithTanim"><img src="https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white" alt="Facebook"></a>
  <a href="https://instagram.com/CodeWithTanim"><img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram"></a>
</p>

---

## ⚖️ Disclaimer & License

This tool is for educational and research purposes. Users are responsible for complying with Google's Terms of Service and local privacy laws (GDPR/CCPA).

**License**: MIT