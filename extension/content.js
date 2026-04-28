/* LeadSniper Lite — content.js
 * Injects a floating control panel onto Google Maps results pages,
 * scrolls the results feed, extracts business data, dedupes, and
 * exports a CSV.
 */

(() => {
  if (window.__leadSniperInjected) return;
  window.__leadSniperInjected = true;

  // ---------- State ----------
  const state = {
    running: false,
    leads: [],
    seen: new Set(), // dedupe keys (name + address)
    onlyNoWebsite: false,
  };

  // ---------- Utilities ----------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);
  const qs = (root, sel) => { try { return root.querySelector(sel); } catch { return null; } };
  const qsa = (root, sel) => { try { return Array.from(root.querySelectorAll(sel)); } catch { return []; } };

  // Find the scrollable results feed (Google Maps left panel)
  function getFeed() {
    return (
      document.querySelector('div[role="feed"]') ||
      document.querySelector('div[aria-label][role="region"]') ||
      document.querySelector('div.m6QErb[aria-label]')
    );
  }

  // Get all listing cards inside the feed
  function getCards(feed) {
    if (!feed) return [];
    // Listings usually have role="article" or are anchored by /maps/place/
    const articles = qsa(feed, 'div[role="article"]');
    if (articles.length) return articles;
    return qsa(feed, 'a.hfpxzc').map((a) => a.closest("div") || a);
  }

  // Extract a single lead from a card element
  function extractLead(card) {
    const link = qs(card, 'a.hfpxzc') || qs(card, 'a[href*="/maps/place/"]');
    const href = link?.href || "";
    const name =
      link?.getAttribute("aria-label") ||
      qs(card, ".qBF1Pd")?.textContent?.trim() ||
      qs(card, "div.fontHeadlineSmall")?.textContent?.trim() ||
      "";

    // Rating + reviews — typically inside a span with aria-label like "4.5 stars 123 Reviews"
    let rating = "";
    let reviews = "";
    const ratingSpan = qs(card, 'span.MW4etd') || qs(card, 'span[role="img"][aria-label*="star" i]');
    if (ratingSpan) {
      rating = qs(card, 'span.MW4etd')?.textContent?.trim() || "";
      const reviewsEl = qs(card, 'span.UY7F9');
      if (reviewsEl) reviews = reviewsEl.textContent.replace(/[()]/g, "").trim();
      if (!rating) {
        const m = ratingSpan.getAttribute("aria-label")?.match(/([\d.]+)\s*stars?\s*([\d,]+)?/i);
        if (m) { rating = m[1] || ""; reviews = m[2] || ""; }
      }
    }

    // Info rows (category, address, phone) live in .W4Efsd lines
    const infoBlocks = qsa(card, "div.W4Efsd");
    let category = "", address = "", phone = "";
    const allText = infoBlocks.map((b) => b.textContent.replace(/\s+/g, " ").trim()).join(" · ");

    // Category & address: usually in a "Category · Address" row
    for (const b of infoBlocks) {
      const spans = qsa(b, "span");
      const text = spans.map((s) => s.textContent.trim()).filter(Boolean);
      if (text.length >= 2 && !category) {
        category = text[0] || "";
        address = text.slice(1).join(", ").replace(/^·\s*/, "");
        break;
      }
    }

    // Phone — match standard formats from the combined text
    const phoneMatch = allText.match(/(\+?\d[\d\s().-]{7,}\d)/);
    if (phoneMatch) phone = phoneMatch[1].trim();

    // Website — Google Maps adds a direct "Website" link on each card
    const websiteEl =
      qs(card, 'a[data-value="Website"]') ||
      qs(card, 'a[aria-label^="Visit"]') ||
      qs(card, 'a[aria-label*="website" i]');
    const website = websiteEl?.href || "";

    if (!name) return null;

    return {
      name,
      category,
      address,
      phone,
      website,
      rating,
      reviews,
      mapsLink: href,
    };
  }

  // Scrape all currently visible cards into state.leads (deduped)
  function scrapeVisible() {
    const feed = getFeed();
    const cards = getCards(feed);
    let added = 0;
    for (const card of cards) {
      const lead = extractLead(card);
      if (!lead) continue;
      const key = (lead.name + "|" + lead.address).toLowerCase();
      if (state.seen.has(key)) continue;
      state.seen.add(key);
      state.leads.push(lead);
      added++;
    }
    return added;
  }

  // Detect the "You've reached the end of the list" sentinel
  function reachedEnd(feed) {
    if (!feed) return true;
    const txt = feed.textContent || "";
    return /end of the list/i.test(txt);
  }

  // Main scraping loop — scrolls the feed and extracts as it goes
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
      scrapeVisible();
      updatePanel();

      feed.scrollTo({ top: feed.scrollHeight, behavior: "smooth" });
      await sleep(rand(1200, 2600)); // polite delay 1.2–2.6s

      const newHeight = feed.scrollHeight;
      if (newHeight === lastHeight) stagnantRounds++;
      else stagnantRounds = 0;
      lastHeight = newHeight;

      if (reachedEnd(feed) || stagnantRounds >= 3) break;
    }

    scrapeVisible();
    state.running = false;
    updatePanel();
    persist();
  }

  // Persist leads via background -> chrome.storage
  function persist() {
    chrome.runtime.sendMessage({ type: "LEADS_UPDATE", leads: state.leads });
  }

  // ---------- CSV export ----------
  function toCSV(rows) {
    const headers = ["Name", "Category", "Address", "Phone", "Website", "Rating", "Reviews", "Google Maps Link"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push([r.name, r.category, r.address, r.phone, r.website, r.rating, r.reviews, r.mapsLink].map(esc).join(","));
    }
    return lines.join("\n");
  }

  function downloadCSV() {
    const rows = filteredLeads();
    if (!rows.length) { alert("No leads to export yet."); return; }
    const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `leadsniper_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
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
    return state.onlyNoWebsite ? state.leads.filter((l) => !l.website) : state.leads;
  }

  // ---------- Floating panel UI ----------
  let panel, countEl, statusEl, tableBody;

  function buildPanel() {
    panel = document.createElement("div");
    panel.id = "leadsniper-panel";
    panel.innerHTML = `
      <div class="ls-header">
        <div class="ls-title"><span class="ls-dot"></span> LeadSniper Lite</div>
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
          <input type="checkbox" id="ls-nowebsite" /> Only show leads without a website
        </label>
        <div class="ls-row">
          <button class="ls-btn ls-ghost" id="ls-preview">👁 Preview</button>
          <button class="ls-btn ls-ghost ls-danger" id="ls-clear">🗑 Clear</button>
        </div>
        <div id="ls-preview-wrap" class="ls-preview-wrap" hidden>
          <table class="ls-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Website</th></tr></thead>
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
    panel.querySelector("#ls-nowebsite").onchange = (e) => {
      state.onlyNoWebsite = e.target.checked;
      renderPreview();
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
  }

  function renderPreview() {
    if (!tableBody) return;
    const rows = filteredLeads().slice(0, 50);
    tableBody.innerHTML = rows
      .map(
        (l) => `<tr>
          <td>${escapeHtml(l.name)}</td>
          <td>${escapeHtml(l.phone)}</td>
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

  // Simple drag handler for the panel header
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

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildPanel);
  } else {
    buildPanel();
  }
})();