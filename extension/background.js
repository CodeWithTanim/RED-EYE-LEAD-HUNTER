// background.js — service worker
// Acts as a message bridge between popup and content script,
// and persists collected leads in chrome.storage.local.

const STORAGE_KEY = "leadsniper_leads";

// Forward popup commands (start/stop/export/clear) to the active Maps tab
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "POPUP_COMMAND") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url || !tab.url.includes("google.com/maps")) {
        sendResponse({ ok: false, error: "Open Google Maps and run a search first." });
        return;
      }
      chrome.tabs.sendMessage(tab.id, msg.payload, (resp) => {
        sendResponse({ ok: true, resp });
      });
    });
    return true; // async response
  }

  // Persist leads pushed from the content script
  if (msg?.type === "LEADS_UPDATE") {
    chrome.storage.local.set({ [STORAGE_KEY]: msg.leads });
  }
});