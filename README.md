# 👁️ RED EYE

> A modern, dark-themed Chrome Extension that scrapes business leads from
> **Google Maps** search results and exports them to a clean **CSV** — ready
> for outreach, cold email, and WhatsApp campaigns.

RED EYE turns any Google Maps search (e.g. *"gym in Guwahati"*, *"dentist in
Lisbon"*, *"coffee shop in Berlin"*) into a structured lead list in seconds.
It auto-scrolls the results panel, opens each listing to harvest contact
details (including email and socials), de-duplicates, and lets you download
everything as a UTF‑8 CSV.

This repository contains **two things**:

1.  **`/extension`** — the actual Chrome Extension (Manifest V3).
2.  **`/src`** — the marketing & download landing page (React + Vite + Tailwind).

---

## ✨ Features

- 🗺️ **Auto-scroll Google Maps** results with polite, randomized 1.2–2.6 s delays.
- 🧠 **Deep scrape** mode — opens each listing's side panel to grab email, WhatsApp, Instagram and Facebook links.
- 📞 **WhatsApp fallback** — auto-builds a `wa.me/<phone>` link when no WA link is published.
- 🧹 **Deduplication** by `Name + Address`.
- 📥 **One-click CSV export** with UTF‑8 BOM (renders correctly in Excel).
- 📋 **Copy all phone numbers** to clipboard.
- 🚫 **Filter:** *Only show leads without a website* — perfect for web-design outreach.
- 👁️ Floating, **draggable, dark-themed panel** injected directly on Google Maps.
- 🔒 **100% local** — no servers, no accounts, no data leaves your browser.

### Fields captured (CSV columns)

| # | Column | Source |
|---|---|---|
| 1 | Business Name | Card / detail panel |
| 2 | Country | Parsed from address |
| 3 | City | Parsed from address |
| 4 | Niche | Google Maps category |
| 5 | Phone | Card + detail panel |
| 6 | WhatsApp | `wa.me` / `api.whatsapp.com` link, or built from phone |
| 7 | Email | `mailto:` link or inline regex on detail panel |
| 8 | Website (Yes/No) | Derived |
| 9 | Website Link | Authority link on detail panel |
| 10 | Google Rating | Card |
| 11 | Review Count | Card |
| 12 | Instagram Link | Detail panel anchors |
| 13 | Facebook Link | Detail panel anchors |
| 14 | Google Map Link | Card `/maps/place/...` URL |

---

## 📁 Project structure

```
.
├── extension/                  # The Chrome Extension (load this folder unpacked)
│   ├── manifest.json           # MV3 manifest
│   ├── background.js           # Service worker (popup ↔ content bridge, storage)
│   ├── content.js              # Floating panel + scraping engine
│   ├── popup.html / popup.js   # Toolbar popup UI
│   ├── styles.css              # Floating panel styles
│   └── icons/icon.png          # RED EYE logo
│
├── public/
│   └── leadsniper-lite.zip     # Pre-packaged extension served by the landing page
│
├── src/                        # React + Vite landing page (download + install guide)
│   ├── pages/Index.tsx
│   ├── assets/red-eye-logo.png
│   └── ...
│
├── index.html
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 🚀 Install the extension (Developer mode)

The extension is **not** on the Chrome Web Store. Install it manually:

1.  Download **`leadsniper-lite.zip`** (from the landing page or `public/`).
2.  **Unzip** it anywhere on your computer.
3.  Open **`chrome://extensions`** in Chrome / Edge / Brave / Arc / Opera.
4.  Enable **Developer mode** (toggle, top-right).
5.  Click **Load unpacked** and select the unzipped folder.

The 👁️ RED EYE icon will appear in your toolbar.

---

## 🧑‍💻 How to use

1.  Open [google.com/maps](https://www.google.com/maps) and run a search, e.g.
    `gym in Guwahati`.
2.  A floating **RED EYE** panel appears on the right.
3.  *(Optional)* Toggle **Deep scrape** — slower, but fills email + socials.
4.  Click **▶ Start**. The extension auto-scrolls and collects leads.
5.  When done (or whenever you want), click **⬇ Export CSV**.
6.  Optional: **⎘ Copy Phones**, **🗑 Clear**, or filter to *no-website* leads.

You can also drive Start / Stop / Export / Clear from the toolbar **popup**.

---

## 🛠️ Develop the landing page

The marketing site (download + install guide) is a standard Vite + React app.

```bash
# install deps
npm install

# dev server
npm run dev

# production build
npm run build
```

The pre-packaged extension lives at `public/leadsniper-lite.zip` and is
served from the site root as `/leadsniper-lite.zip`.

---

## 🧪 Develop / repackage the extension

After editing anything inside `/extension`:

```bash
# from the project root
rm -f public/leadsniper-lite.zip
cd extension && zip -r ../public/leadsniper-lite.zip .
```

Then in Chrome go to `chrome://extensions` and click the **reload** ↻ icon
on the RED EYE card.

While iterating you don't need to re-zip — just **Load unpacked** the
`extension/` folder directly and reload after each change.

---

## 🧰 Tech stack

- **Extension:** Vanilla JS, Chrome Manifest V3, `chrome.storage.local`,
  `chrome.scripting`, content script injection.
- **Landing page:** React 18, Vite 5, TypeScript, Tailwind CSS v3, shadcn/ui,
  lucide-react.

---

## ⚠️ Disclaimer & responsible use

RED EYE only reads data that is **already publicly visible** in your own
browser when you visit Google Maps — it does not bypass any login, captcha,
or rate limit. That said:

- Scraping may violate **Google's Terms of Service**. Use at your own risk.
- Respect local laws (GDPR / CAN‑SPAM / PECR / etc.) when contacting leads.
- Always honor opt-out requests and never spam.

This tool is provided **as-is**, for educational and personal-research
purposes. The authors accept no liability for misuse.

---

## 📝 License

MIT — do whatever you want, just don't blame us.

---

👁️ **RED EYE** — *See every lead.*