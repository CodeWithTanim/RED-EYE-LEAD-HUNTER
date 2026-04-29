/* LeadSniper Lite — content.js
 * Scrapes Google Maps search results, opens each listing's detail
 * panel to grab email/socials/WhatsApp, dedupes, and exports CSV.
 */

(() => {
  if (window.__leadSniperInjected) return;
  window.__leadSniperInjected = true;

  // ---------- State ----------
  const state = {
    running: false,
    leads: [],
    seen: new Set(),
    onlyNoWebsite: false,
    deepScrape: true, // open each card to extract email + socials
  };

  // ---------- Utilities ----------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);
  const qs = (root, sel) => { try { return root.querySelector(sel); } catch { return null; } };
  const qsa = (root, sel) => { try { return Array.from(root.querySelectorAll(sel)); } catch { return []; } };
  const cleanUrl = (url) => {
    if (!url) return "";
    try {
      const u = new URL(url);
      if (u.hostname.includes("google.") && u.pathname === "/url") {
        return u.searchParams.get("q") || url;
      }
    } catch (e) {}
    return url;
  };
  const isUnrelated = (url, label) => {
    if (!url) return true;
    const lowerUrl = url.toLowerCase();
    const lowerLabel = (label || "").toLowerCase();
    const unrelatedPatterns = [
      "google.com/searchviewer",
      "google.com/maps/reserve",
      "eat.chownow.com",
      "opentable.com",
      "allmenus.com",
      "fooddiscoveryapp.com"
    ];
    if (unrelatedPatterns.some((p) => lowerUrl.includes(p))) return true;
    if (lowerLabel.includes("menu") || lowerLabel.includes("order online") || lowerLabel.includes("reservation")) return true;
    return false;
  };

  function getFeed() {
    return (
      document.querySelector('div[role="feed"]') ||
      document.querySelector('div[aria-label][role="region"]') ||
      document.querySelector('div.m6QErb[aria-label]')
    );
  }

  function getCards(feed) {
    if (!feed) return [];
    const articles = qsa(feed, 'div[role="article"]');
    if (articles.length) return articles;
    return qsa(feed, 'a.hfpxzc').map((a) => a.closest("div") || a);
  }

  // ---------- Address parsing (country/city) ----------
  function parseAddress(address) {
    if (!address) return { city: "", country: "" };
    const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
    let country = "";
    let city = "";
    if (parts.length >= 2) {
      country = parts[parts.length - 1];
      // strip postal code from country segment if present
      country = country.replace(/\b\d{3,}\b/g, "").trim();
      // city = second-to-last segment, strip postal codes
      city = parts[parts.length - 2].replace(/\b\d{3,}[A-Z]?\b/g, "").trim();
    } else if (parts.length === 1) {
      city = parts[0];
    }
    return { city, country };
  }

  // ---------- Card-level extraction (cheap) ----------
  function extractCardLead(card) {
    const link = qs(card, 'a.hfpxzc') || qs(card, 'a[href*="/maps/place/"]');
    const href = link?.href || "";
    const name =
      link?.getAttribute("aria-label") ||
      qs(card, ".qBF1Pd")?.textContent?.trim() ||
      qs(card, "div.fontHeadlineSmall")?.textContent?.trim() ||
      "";

    let rating = "";
    let reviews = "";
    const ratingEl = qs(card, "span.MW4etd");
    const reviewsEl = qs(card, "span.UY7F9");
    if (ratingEl) rating = ratingEl.textContent.trim();
    if (reviewsEl) reviews = reviewsEl.textContent.replace(/[()]/g, "").trim();
    if (!rating) {
      const aria = qs(card, 'span[role="img"][aria-label*="star" i]')?.getAttribute("aria-label") || "";
      const m = aria.match(/([\d.]+)\s*stars?\s*([\d,]+)?/i);
      if (m) { rating = m[1] || ""; reviews = m[2] || ""; }
    }

    const infoBlocks = qsa(card, "div.W4Efsd");
    let category = "", address = "", phone = "";
    const allText = infoBlocks.map((b) => b.textContent.replace(/\s+/g, " ").trim()).join(" · ");

    for (const b of infoBlocks) {
      const spans = qsa(b, "span");
      const text = spans.map((s) => s.textContent.trim()).filter(Boolean);
      if (text.length >= 2 && !category) {
        category = text[0] || "";
        address = text.slice(1).join(", ").replace(/^·\s*/, "");
        break;
      }
    }

    const phoneMatch = allText.match(/(\+?\d[\d\s().-]{7,}\d)/);
    if (phoneMatch) phone = phoneMatch[1].trim();

    const websiteEl =
      qs(card, 'a[data-value="Website"]') ||
      qs(card, 'a[aria-label*="website" i]');
    let website = cleanUrl(websiteEl?.href || "");
    if (isUnrelated(website, websiteEl?.getAttribute("aria-label"))) website = "";

    if (!name) return null;
    const { city, country } = parseAddress(address);

    return {
      name,
      niche: category,
      country,
      city,
      address,
      phone,
      whatsapp: "",
      email: "",
      hasWebsite: website ? "Yes" : "No",
      website,
      rating,
      reviews,
      instagram: "",
      facebook: "",
      mapsLink: href,
      _card: card,
    };
  }

  // ---------- Detail-panel extraction (deep) ----------
  // Opens a card by clicking it, waits for the side panel to populate,
  // then harvests email/socials/whatsapp + better phone/website/address.
  async function enrichFromDetail(lead) {
    const card = lead._card;
    const link = qs(card, 'a.hfpxzc') || qs(card, 'a[href*="/maps/place/"]');
    if (!link) return lead;

    link.click();
    // Wait for the detail panel to load and update to the NEW business (avoid stale data)
    let panelEl = null;
    for (let i = 0; i < 30; i++) {
      await sleep(200);
      panelEl =
        document.querySelector('div[role="main"][aria-label]') ||
        document.querySelector('div.m6QErb.DxyBCb') ||
        document.querySelector('div[role="region"][aria-label]');
      const heading = panelEl && qs(panelEl, "h1")?.textContent?.trim();
      if (heading && (heading.includes(lead.name) || lead.name.includes(heading))) break;
    }
    if (!panelEl) return lead;

    await sleep(rand(400, 800));

    // Better address
    const addrBtn = qs(panelEl, 'button[data-item-id="address"]');
    if (addrBtn) {
      const txt = addrBtn.getAttribute("aria-label")?.replace(/^Address:\s*/i, "").trim() ||
        qs(addrBtn, "div.Io6YTe")?.textContent?.trim() || "";
      if (txt) {
        lead.address = txt;
        const { city, country } = parseAddress(txt);
        lead.city = city || lead.city;
        lead.country = country || lead.country;
      }
    }

    // Phone
    const phoneBtn = qs(panelEl, 'button[data-item-id^="phone"]');
    if (phoneBtn) {
      const txt = phoneBtn.getAttribute("aria-label")?.replace(/^Phone:\s*/i, "").trim() ||
        qs(phoneBtn, "div.Io6YTe")?.textContent?.trim() || "";
      if (txt) lead.phone = txt;
    }

    // Website (authority link)
    const siteBtn =
      qs(panelEl, 'a[data-item-id="authority"]') ||
      qs(panelEl, 'a[aria-label^="Website:"]') ||
      qs(panelEl, 'a[aria-label="Open website"]') ||
      qs(panelEl, 'a[aria-label^="Website"]');
    if (siteBtn?.href) {
      const url = cleanUrl(siteBtn.href);
      const label = siteBtn.getAttribute("aria-label");
      if (url && !url.includes("google.com/maps") && !isUnrelated(url, label)) {
        lead.website = url;
        lead.hasWebsite = "Yes";
      }
    }

    // Scan all anchors in the panel for socials / whatsapp / mailto
    const anchors = qsa(panelEl, "a[href]");
    for (const a of anchors) {
      const href = a.href || "";
      if (!href) continue;
      if (!lead.email && href.startsWith("mailto:")) {
        lead.email = href.replace(/^mailto:/, "").split("?")[0];
      }
      if (!lead.whatsapp && /(wa\.me|api\.whatsapp\.com|whatsapp\.com\/send)/i.test(href)) {
        lead.whatsapp = href;
      }
      if (!lead.instagram && /instagram\.com\//i.test(href)) {
        lead.instagram = href;
      }
      if (!lead.facebook && /(facebook\.com|fb\.com)\//i.test(href)) {
        lead.facebook = href;
      }
    }

    // If no email found in panel and we have a website, try to scan the
    // panel text for any email pattern (some businesses list it inline).
    if (!lead.email) {
      const m = (panelEl.textContent || "").match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
      if (m) lead.email = m[0];
    }

    // Phone-derived WhatsApp fallback (best-effort)
    if (!lead.whatsapp && lead.phone) {
      const digits = lead.phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
      if (/^\+?\d{8,15}$/.test(digits)) {
        lead.whatsapp = `https://wa.me/${digits.replace(/^\+/, "")}`;
      }
    }

    return lead;
  }

  // ---------- Scrape orchestration ----------
  async function scrapeVisible() {
    const feed = getFeed();
    const cards = getCards(feed);
    let added = 0;
    for (const card of cards) {
      const lead = extractCardLead(card);
      if (!lead) continue;
      const key = (lead.name + "|" + lead.address).toLowerCase();
      if (state.seen.has(key)) continue;
      state.seen.add(key);

      if (state.deepScrape) {
        try { await enrichFromDetail(lead); } catch (e) { /* keep card-level data */ }
        await sleep(rand(300, 700));
      }
      delete lead._card;
      state.leads.push(lead);
      added++;
      updatePanel();
      if (!state.running) break;
    }
    return added;
  }

  function reachedEnd(feed) {
    if (!feed) return true;
    const txt = feed.textContent || "";
    return /end of the list/i.test(txt);
  }

  async function runScraping() {
    const feed = getFeed();
    if (!feed) {
      alert("LeadSniper: Couldn't find the results panel. Run a Maps search first.");
      state.running = false;
      updatePanel();
      return;
    }

    let stagnantRounds = 0;
    let lastHeight = feed.scrollHeight;

    while (state.running) {
      await scrapeVisible();
      if (!state.running) break;

      feed.scrollTo({ top: feed.scrollHeight, behavior: "smooth" });
      await sleep(rand(1200, 2600));

      const newHeight = feed.scrollHeight;
      if (newHeight === lastHeight) stagnantRounds++;
      else stagnantRounds = 0;
      lastHeight = newHeight;

      if (reachedEnd(feed) || stagnantRounds >= 3) break;
    }

    state.running = false;
    updatePanel();
    persist();
  }

  function persist() {
    chrome.runtime.sendMessage({ type: "LEADS_UPDATE", leads: state.leads });
  }

  // ---------- CSV export ----------
  const CSV_HEADERS = [
    "Business Name", "Country", "City", "Niche",
    "Phone", "WhatsApp", "Email",
    "Website (Yes/No)", "Website Link",
    "Google Rating", "Review Count",
    "Instagram Link", "Facebook Link", "Google Map Link",
  ];

  function toCSV(rows) {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [CSV_HEADERS.join(",")];
    for (const r of rows) {
      lines.push([
        r.name, r.country, r.city, r.niche,
        r.phone, r.whatsapp, r.email,
        r.hasWebsite, r.website,
        r.rating, r.reviews,
        r.instagram, r.facebook, r.mapsLink,
      ].map(esc).join(","));
    }
    return lines.join("\n");
  }

  function downloadCSV() {
    const rows = filteredLeads();
    if (!rows.length) { alert("No leads to export yet."); return; }
    const blob = new Blob(["\ufeff" + toCSV(rows)], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    a.download = `RedEye_${ymd}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  function copyPhones() {
    const phones = filteredLeads().map((l) => l.phone).filter(Boolean);
    if (!phones.length) { alert("No phone numbers collected yet."); return; }
    navigator.clipboard.writeText(phones.join("\n")).then(() => {
      flashStatus(`Copied ${phones.length} phone numbers`);
    });
  }

  function filteredLeads() {
    return state.onlyNoWebsite ? state.leads.filter((l) => l.hasWebsite === "No") : state.leads;
  }

  // ---------- Floating panel UI ----------
  let panel, countEl, statusEl, tableBody;

  function buildPanel() {
    panel = document.createElement("div");
    panel.id = "leadsniper-panel";
    panel.innerHTML = `
      <div class="ls-header">
        <div class="ls-title"><span class="ls-dot"></span> RED EYE</div>
        <button class="ls-icon" id="ls-min" title="Minimize">—</button>
      </div>
      <div class="ls-body">
        <div class="ls-row">
          <button class="ls-btn ls-primary" id="ls-start">▶ Start</button>
          <button class="ls-btn ls-ghost" id="ls-stop">■ Stop</button>
        </div>
        <div class="ls-stats">
          <span id="ls-count">0</span> leads collected
          <span id="ls-status" class="ls-status"></span>
        </div>
        <div class="ls-row">
          <button class="ls-btn" id="ls-export">⬇ Export CSV</button>
          <button class="ls-btn" id="ls-copy">⎘ Copy Phones</button>
        </div>
        <label class="ls-check">
          <input type="checkbox" id="ls-deep" checked /> Deep scrape (email + socials, slower)
        </label>
        <label class="ls-check">
          <input type="checkbox" id="ls-nowebsite" /> Only show leads without a website
        </label>
        <div class="ls-row">
          <button class="ls-btn ls-ghost" id="ls-preview">👁 Preview</button>
          <button class="ls-btn ls-ghost ls-danger" id="ls-clear">🗑 Clear</button>
        </div>
        <div id="ls-preview-wrap" class="ls-preview-wrap" hidden>
          <table class="ls-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Site</th></tr></thead>
            <tbody id="ls-tbody"></tbody>
          </table>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    countEl = panel.querySelector("#ls-count");
    statusEl = panel.querySelector("#ls-status");
    tableBody = panel.querySelector("#ls-tbody");

    panel.querySelector("#ls-start").onclick = () => {
      if (state.running) return;
      state.running = true;
      updatePanel();
      runScraping();
    };
    panel.querySelector("#ls-stop").onclick = () => { state.running = false; updatePanel(); };
    panel.querySelector("#ls-export").onclick = downloadCSV;
    panel.querySelector("#ls-copy").onclick = copyPhones;
    panel.querySelector("#ls-clear").onclick = () => {
      if (!confirm("Clear all collected leads?")) return;
      state.leads = []; state.seen.clear(); persist(); updatePanel(); renderPreview();
    };
    panel.querySelector("#ls-deep").onchange = (e) => { state.deepScrape = e.target.checked; };
    panel.querySelector("#ls-nowebsite").onchange = (e) => {
      state.onlyNoWebsite = e.target.checked;
      renderPreview();
      updatePanel();
    };
    panel.querySelector("#ls-preview").onclick = () => {
      const wrap = panel.querySelector("#ls-preview-wrap");
      wrap.hidden = !wrap.hidden;
      if (!wrap.hidden) renderPreview();
    };
    panel.querySelector("#ls-min").onclick = () => panel.classList.toggle("ls-min");

    makeDraggable(panel, panel.querySelector(".ls-header"));
  }

  function updatePanel() {
    if (!panel) return;
    countEl.textContent = filteredLeads().length;
    statusEl.textContent = state.running ? "• scraping…" : "";
    statusEl.className = "ls-status" + (state.running ? " ls-live" : "");
    renderPreview();
  }

  function renderPreview() {
    if (!tableBody) return;
    const rows = filteredLeads().slice(0, 50);
    tableBody.innerHTML = rows
      .map(
        (l) => `<tr>
          <td>${escapeHtml(l.name)}</td>
          <td>${escapeHtml(l.phone)}</td>
          <td>${escapeHtml(l.email || "—")}</td>
          <td>${l.website ? `<a href="${l.website}" target="_blank" rel="noopener">link</a>` : "—"}</td>
        </tr>`
      )
      .join("");
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function flashStatus(text) {
    if (!statusEl) return;
    const prev = statusEl.textContent;
    statusEl.textContent = "• " + text;
    setTimeout(() => { statusEl.textContent = prev; }, 1800);
  }

  function makeDraggable(el, handle) {
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
    handle.style.cursor = "move";
    handle.addEventListener("mousedown", (e) => {
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      const rect = el.getBoundingClientRect();
      ox = rect.left; oy = rect.top;
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      el.style.left = (ox + e.clientX - sx) + "px";
      el.style.top = (oy + e.clientY - sy) + "px";
      el.style.right = "auto";
    });
    document.addEventListener("mouseup", () => { dragging = false; });
  }

  // ---------- Messages from popup ----------
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.action === "start") { if (!state.running) { state.running = true; updatePanel(); runScraping(); } sendResponse({ count: state.leads.length }); }
    else if (msg?.action === "stop") { state.running = false; updatePanel(); sendResponse({ count: state.leads.length }); }
    else if (msg?.action === "export") { downloadCSV(); sendResponse({ count: state.leads.length }); }
    else if (msg?.action === "status") { sendResponse({ count: state.leads.length, running: state.running }); }
    else if (msg?.action === "clear") { state.leads = []; state.seen.clear(); persist(); updatePanel(); sendResponse({ count: 0 }); }
    return true;
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildPanel);
  } else {
    buildPanel();
  }
})();