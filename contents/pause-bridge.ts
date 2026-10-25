import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start"
}

console.log("🔌 SafeSign: Pause Bridge Loaded")
// --- NEW: AUTO-PAUSE ON LOCALHOST ---
const currentUrl = window.location.href
if (currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1")) {
  console.log("⏸️ SafeSign Bridge: Auto-pausing on Localhost.")
  // Send the pause command immediately to the Brain
  window.postMessage({ type: "SAFESIGN_PAUSE_STATE", paused: true }, "*")
}
// ------------------------------------

// Use native Chrome storage listener
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.safesign_paused) {
    const isPaused = changes.safesign_paused.newValue === true
    // Send the message to the MAIN world
    window.postMessage({ type: "SAFESIGN_PAUSE_STATE", paused: isPaused }, "*")
  }
})

// Also check on page load
chrome.storage.local.get("safesign_paused", (result) => {
  if (result.safesign_paused === true) {
    window.postMessage({ type: "SAFESIGN_PAUSE_STATE", paused: true }, "*")
  }
})