// popup.js — sends commands to active Maps tab via background worker
const $ = (id) => document.getElementById(id);
const err = $("err");
const count = $("count");

function send(action) {
  err.textContent = "";
  chrome.runtime.sendMessage({ type: "POPUP_COMMAND", payload: { action } }, (resp) => {
    if (!resp?.ok) { err.textContent = resp?.error || "Couldn't reach Google Maps tab."; return; }
    if (resp.resp?.count != null) count.textContent = resp.resp.count;
  });
}

$("start").onclick = () => send("start");
$("stop").onclick = () => send("stop");
$("export").onclick = () => send("export");
$("clear").onclick = () => send("clear");

// Refresh count on open
send("status");
setInterval(() => send("status"), 2000);