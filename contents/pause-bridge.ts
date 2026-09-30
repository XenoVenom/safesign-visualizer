import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start"
}

console.log("🔌 SafeSign: Pause Bridge Loaded")

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