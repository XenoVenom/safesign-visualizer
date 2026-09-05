import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start",
  world: "MAIN"
}

console.log("🛡️ SafeSign: Interceptor Loaded in MAIN world")

// --- BLACKLIST & DOMAIN FETCHING ---
let scamBlacklist = new Set<string>()
let blockedDomains = new Set<string>()
let listsLoaded = false // NEW: Wait for lists before checking

const updateLists = async () => {
  try {
    // Fetch Address Blacklist
    const addrRes = await fetch("https://raw.githubusercontent.com/XenoVenom/safesign-visualizer/main/blacklist.json")
    const addrData = await addrRes.json()
    scamBlacklist = new Set(addrData.map((addr: string) => addr.toLowerCase()))

    // Fetch Domain Blacklist
    const domRes = await fetch("https://raw.githubusercontent.com/XenoVenom/safesign-visualizer/main/blocked-domains.json")
    const domData = await domRes.json()
    blockedDomains = new Set(domData)
  } catch (e) {
    console.log("🛡️ SafeSign: Could not update blocklists.")
  }
  listsLoaded = true // Download is finished!
}
updateLists()
setInterval(updateLists, 3600000)
// ------------------------------

const intercept = () => {
  // 1. Wait for the blocklists to download before doing anything
  if (!listsLoaded) {
     setTimeout(intercept, 10) // Check again in 10ms
     return
  }

  // 2. Check if the current site is a known scam
  const currentDomain = window.location.hostname.replace(/^www\./, '').toLowerCase()
  if (blockedDomains.has(currentDomain)) {
     console.warn("🚨 BLOCKING: Known Phishing Website!")
     window.postMessage({ 
       type: "SAFESIGN_ALERT", 
       payload: { dangerType: "PHISHING_SITE" } 
     }, "*")
     
     // Break window.ethereum so the site can't ask the user to connect
     window.ethereum = undefined
     return // Stop hooking, the site is dead
  }

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

           // --- NEW: CHECK 4 (Permit Signatures & SIWE Login) ---
      if (args.method === "eth_signTypedData_v4" || args.method === "eth_signTypedData_v3") {
         let isPermitScam = false;
         let scammerAddr = "Unknown";
         let parsedData: any = null; // Moved declaration up here!

         try {
            // Try to parse the JSON payload
            parsedData = typeof args.params[1] === 'string' ? JSON.parse(args.params[1]) : args.params[1];
            
            // Check if it's a Permit (EIP-2612)
            const isPermit = parsedData?.primaryType === "Permit" || parsedData?.primaryType === "PermitSingle";
            const hasPermitFields = parsedData?.message?.spender && parsedData?.message?.value;

            if (isPermit || hasPermitFields) {
               isPermitScam = true;
               scammerAddr = parsedData?.message?.spender || "Unknown";
            }
         } catch (e) {}

         // If we detected a Permit scam, throw the error
         if (isPermitScam) {
            console.warn("🚨 BLOCKING: Hidden Permit Signature Drain")
            window.postMessage({ 
              type: "SAFESIGN_ALERT", 
              payload: { dangerType: "PERMIT_DRAIN", scamAddress: scammerAddr } 
            }, "*")
            throw new Error("SafeSign: Blocked Gasless Permit Drain")
         }

         // --- NEW: SIWE Domain Mismatch Check (EIP-4361) ---
         if (parsedData?.message?.domain) {
            // Get the domain the message CLAIMS to be from
            const claimedDomain = parsedData.message.domain.toLowerCase().replace(/^www\./, '');
            // Get the domain the user is ACTUALLY on
            const actualDomain = window.location.hostname.replace(/^www\./, '').toLowerCase();
            
            // If they don't match, it's a spoofed login!
            if (claimedDomain && claimedDomain !== actualDomain) {
               console.warn("🚨 BLOCKING: Spoofed SIWE Login Domain")
               window.postMessage({ 
                 type: "SAFESIGN_ALERT", 
                 payload: { dangerType: "SIWE_SPOOF", scamAddress: window.location.hostname } 
               }, "*")
               throw new Error("SafeSign: Blocked Spoofed Login")
            }
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