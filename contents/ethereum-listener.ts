import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start",
  world: "MAIN"
}

console.log("🛡️ SafeSign: Interceptor Loaded in MAIN world")

// --- NEW: BLACKLIST FETCHING ---
let scamBlacklist = new Set<string>()

const updateBlacklist = async () => {
  try {
    // REPLACE THIS WITH YOUR RAW GITHUB URL!
    const response = await fetch("https://raw.githubusercontent.com/XenoVenom/safesign-visualizer/main/blacklist.json")
    const data = await response.json()
    // Convert to lowercase and store in a Set for fast lookups
    scamBlacklist = new Set(data.map((addr: string) => addr.toLowerCase()))
    console.log("🛡️ SafeSign: Blacklist updated.", scamBlacklist.size, "scams tracked.")
  } catch (e) {
    console.log("🛡️ SafeSign: Could not update blacklist.")
  }
}

// Run immediately, and then update every hour
updateBlacklist()
setInterval(updateBlacklist, 3600000)
// ------------------------------

const intercept = () => {
  if (window.ethereum) {
    const originalRequest = window.ethereum.request
    
    window.ethereum.request = async (args) => {
      const silentMethods = ["eth_blockNumber", "eth_chainId", "net_version", "eth_gasPrice", "eth_accounts"]
      
      if (!silentMethods.includes(args.method)) {
        console.log("🧠 SafeSign Caught:", args.method)
      }

      if (args.method === "eth_sendTransaction") {
         const data = args.params?.[0]?.data
         const toAddress = args.params?.[0]?.to?.toLowerCase()
         
         // --- NEW: CHECK AGAINST COMMUNITY BLACKLIST ---
         if (scamBlacklist.has(toAddress)) {
            console.warn("🚨 BLOCKING: Known Scam Address Detected")
            window.postMessage({ 
              type: "SAFESIGN_ALERT", 
              payload: { dangerType: "KNOWN_SCAM" } 
            }, "*")
            throw new Error("SafeSign: Blocked Known Scam")
         }

         if (data) {
           // Check 1: Unlimited Token Approval
           if (data.startsWith("0x095ea7b3")) {
             const amountHex = data.slice(74)
             const maxUint = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
             if (amountHex === maxUint) {
                console.warn("🚨 BLOCKING: Unlimited Token Approval")
                window.postMessage({ 
                  type: "SAFESIGN_ALERT", 
                  payload: { dangerType: "TOKEN_DRAIN" } 
                }, "*")
                throw new Error("SafeSign: Blocked Dangerous Transaction")
             }
           }

           // Check 2: NFT Collection Drain
           if (data.startsWith("0xa22cb465")) {
             if (data.endsWith("0000000000000000000000000000000000000000000000000000000000000001")) {
                console.warn("🚨 BLOCKING: NFT Collection Drain")
                window.postMessage({ 
                  type: "SAFESIGN_ALERT", 
                  payload: { dangerType: "NFT_DRAIN" } 
                }, "*")
                throw new Error("SafeSign: Blocked Dangerous Transaction")
             }
           }
         }
      }

      // Safe Signal
      const criticalMethods = ["eth_sendTransaction", "eth_signTransaction", "personal_sign"]
      if (criticalMethods.includes(args.method)) {
         window.postMessage({ 
           type: "SAFESIGN_SAFE", 
           payload: { method: args.method } 
         }, "*")
      }

      return originalRequest.apply(window.ethereum, [args])
    }
  } else {
    setTimeout(intercept, 50)
  }
}

intercept()