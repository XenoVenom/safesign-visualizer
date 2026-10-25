import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start"
}

console.log("📒 SafeSign: History Bridge Loaded")

// Listen for messages from the Brain
window.addEventListener("message", async (event) => {
  if (event.data.type === "SAFESIGN_CHECK_POISON") {
    const checkAddress = event.data.payload.toLowerCase()
    
    // Get previously interacted addresses
    const result = await chrome.storage.local.get("safesign_history")
    const history: string[] = result.safesign_history || []

    let isPoison = false
    let matchedSafeAddress = ""

    for (const safeAddr of history) {
      if (safeAddr === checkAddress) {
        // Exact match, definitely safe
        isPoison = false
        break
      }
      
      // Check if first 6 and last 4 match (Address Poisoning heuristic)
      if (safeAddr.length >= 10 && checkAddress.length >= 10) {
        const safeStart = safeAddr.slice(0, 8) // 0x + 6 chars
        const safeEnd = safeAddr.slice(-4)
        const checkStart = checkAddress.slice(0, 8)
        const checkEnd = checkAddress.slice(-4)

        if (safeStart === checkStart && safeEnd === checkEnd) {
          // Looks similar but not exact!
          isPoison = true
          matchedSafeAddress = safeAddr
          break
        }
      }
    }

    // Send result back to the Brain
    window.postMessage({ 
      type: "SAFESIGN_POISON_RESULT", 
      payload: { isPoison, matchedSafeAddress, checkAddress } 
    }, "*")
  }
  
  // If a transaction is safe, add it to history
  if (event.data.type === "SAFESIGN_ADD_HISTORY") {
    const newAddress = event.data.payload.toLowerCase()
    const result = await chrome.storage.local.get("safesign_history")
    const history: string[] = result.safesign_history || []
    if (!history.includes(newAddress)) {
      history.push(newAddress)
      // Keep history capped at 100 addresses to save space
      if (history.length > 100) history.shift()
      await chrome.storage.local.set({ safesign_history: history })
    }
  }
})