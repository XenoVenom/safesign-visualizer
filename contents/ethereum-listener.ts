import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start",
  world: "MAIN"
}

console.log("🛡️ SafeSign: Interceptor Loaded in MAIN world")

const intercept = () => {
  if (window.ethereum) {
    const originalRequest = window.ethereum.request
    
    window.ethereum.request = async (args) => {
      
      // 1. Silence the noise (background requests we don't need to log)
      const silentMethods = ["eth_blockNumber", "eth_chainId", "net_version", "eth_gasPrice", "eth_accounts"]
      
      if (!silentMethods.includes(args.method)) {
        console.log("🧠 SafeSign Caught:", args.method)
      }

      // 2. SECURITY LOGIC (The Checks)
      if (args.method === "eth_sendTransaction") {
         const data = args.params?.[0]?.data
         
         if (data) {
           // --- Check 1: Unlimited Token Approval ---
           // Signature: 0x095ea7b3
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

           // --- Check 2: NFT Collection Drain ---
           // Signature: 0xa22cb465 (setApprovalForAll)
           if (data.startsWith("0xa22cb465")) {
             // Check if the last parameter is '1' (True/Approve)
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

      // 3. "GREEN LIGHT" SIGNAL (The New Feature)
      // If we didn't throw an error above, the transaction is SAFE.
      // We signal the UI to show the "Green Toast" for critical actions.
      const criticalMethods = ["eth_sendTransaction", "eth_signTransaction", "personal_sign"]
      if (criticalMethods.includes(args.method)) {
         window.postMessage({ 
           type: "SAFESIGN_SAFE", 
           payload: { method: args.method } 
         }, "*")
      }

      // 4. Proceed to Wallet (MetaMask)
      return originalRequest.apply(window.ethereum, [args])
    }
  } else {
    // If wallet not found yet, try again in 50ms
    setTimeout(intercept, 50)
  }
}

// Start the interceptor
intercept()