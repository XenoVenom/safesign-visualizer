import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start",
  world: "MAIN"
}

console.log("🛡️ SafeSign: Interceptor Loaded in MAIN world")

// --- BLACKLIST FETCHING ---
let scamBlacklist = new Set<string>()

const updateBlacklist = async () => {
  try {
    const response = await fetch("https://raw.githubusercontent.com/XenoVenom/safesign-visualizer/main/blacklist.json")
    const data = await response.json()
    scamBlacklist = new Set(data.map((addr: string) => addr.toLowerCase()))
  } catch (e) {}
}
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
         
         // CHECK 1: Community Blacklist
         if (scamBlacklist.has(toAddress)) {
            window.postMessage({ 
              type: "SAFESIGN_ALERT", 
              payload: { dangerType: "KNOWN_SCAM", scamAddress: toAddress } 
            }, "*")
            throw new Error("SafeSign: Blocked Known Scam")
         }

         if (data) {
           // CHECK 2: Unlimited Token Approval
           if (data.startsWith("0x095ea7b3")) {
             const amountHex = data.slice(74)
             const maxUint = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
             if (amountHex === maxUint) {
                window.postMessage({ 
                  type: "SAFESIGN_ALERT", 
                  payload: { dangerType: "TOKEN_DRAIN", scamAddress: args.params?.[0]?.to } 
                }, "*")
                throw new Error("SafeSign: Blocked Dangerous Transaction")
             }
           }

           // CHECK 3: NFT Collection Drain
           if (data.startsWith("0xa22cb465")) {
             if (data.endsWith("0000000000000000000000000000000000000000000000000000000000000001")) {
                window.postMessage({ 
                  type: "SAFESIGN_ALERT", 
                  payload: { dangerType: "NFT_DRAIN", scamAddress: args.params?.[0]?.to } 
                }, "*")
                throw new Error("SafeSign: Blocked Dangerous Transaction")
             }
           }
         }
      }

            // --- NEW: CHECK 4 (Permit Signatures / EIP-2612) ---
      if (args.method === "eth_signTypedData_v4" || args.method === "eth_signTypedData_v3") {
         let isPermitScam = false;
         let scammerAddr = "Unknown";

         try {
            // Try to parse the JSON payload
            const typedData = typeof args.params[1] === 'string' ? JSON.parse(args.params[1]) : args.params[1];
            
            // Check if it's a Permit (EIP-2612) or PermitSingle (Uniswap Permit2)
            const isPermit = typedData?.primaryType === "Permit" || typedData?.primaryType === "PermitSingle";
            const hasPermitFields = typedData?.message?.spender && typedData?.message?.value;

            if (isPermit || hasPermitFields) {
               isPermitScam = true;
               scammerAddr = typedData?.message?.spender || "Unknown";
            }
         } catch (e) {
            // If JSON parsing fails, just let it pass through to avoid breaking legit apps
         }

         // If we detected a scam, throw the error OUTSIDE the try/catch
         if (isPermitScam) {
            console.warn("🚨 BLOCKING: Hidden Permit Signature Drain")
            window.postMessage({ 
              type: "SAFESIGN_ALERT", 
              payload: { dangerType: "PERMIT_DRAIN", scamAddress: scammerAddr } 
            }, "*")
            throw new Error("SafeSign: Blocked Gasless Permit Drain")
         }
      }

      // Safe Signal
      const criticalMethods = ["eth_sendTransaction", "eth_signTransaction", "personal_sign", "eth_signTypedData_v4"]
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