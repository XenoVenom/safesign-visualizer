import type { PlasmoCSConfig } from "plasmo"
import { useState, useEffect } from "react"
import dangerLogo from "data-url:../assets/shield-danger.png"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
}

const WarningOverlay = () => {
  const [visible, setVisible] = useState(false)
  const [dangerType, setDangerType] = useState("UNKNOWN")
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "SAFESIGN_ALERT") {
        setDangerType(event.data.payload.dangerType || "UNKNOWN")
        setData(event.data.payload)
        setVisible(true)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  if (!visible) return null

  // Dynamic Content based on Danger Type
  let title = "Attack Blocked"
  let explanation = "This transaction is unsafe."
  let node2Text = "Hidden malicious logic detected."

  if (dangerType === "TOKEN_DRAIN") {
    title = "Token Drain Blocked"
    explanation = "A site is trying to get UNLIMITED access to your tokens."
    node2Text = "Site gains Unlimited Access to your tokens."
  } else if (dangerType === "NFT_DRAIN") {
    title = "NFT Drain Blocked"
    explanation = "A site is trying to steal your ENTIRE NFT collection."
    node2Text = "Site gains access to ALL your NFTs in this collection."
    } else if (dangerType === "KNOWN_SCAM") {
    title = "Known Scam Blocked"
    explanation = "This address is a verified scammer tracked by the SafeSign community."
    node2Text = "Funds sent to this address are lost forever."
    } else if (dangerType === "PERMIT_DRAIN") {
    title = "Hidden Permit Drain Blocked"
    explanation = "This 'Free Login' is actually a hidden permission to drain your tokens!"
    node2Text = "Site gets a signed permission slip to empty your wallet (gasless)."
    } else if (dangerType === "PHISHING_SITE") {
    title = "PHISHING WEBSITE DETECTED"
    explanation = "This website is a verified scam. SafeSign has disabled your wallet on this page. Do not connect your wallet. Leave immediately!"
    node2Text = "This site is designed to steal your funds the moment you connect."
  } else if (dangerType === "SIWE_SPOOF") {
    title = "Spoofed Login Blocked"
    explanation = "This 'Sign-In' message is pretending to be a different website. If you sign this, scammers can use it to trick you later."
    node2Text = "The domain in the login message does not match the website you are on."
  }

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.95)",
      zIndex: 2147483647,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        background: "linear-gradient(145deg, #1a1a1a, #111)",
        border: "2px solid #ff4d4d",
        borderRadius: "24px",
        padding: "40px",
        maxWidth: "500px",
        width: "90%",
        textAlign: "center",
        boxShadow: "0 0 50px rgba(255, 0, 0, 0.2)"
      }}>
        
        {/* Header */}
        <div style={{ marginBottom: "10px" }}>
          <img src={dangerLogo} style={{ width: 60, height: 60 }} alt="Shield" />
        </div>
        <h1 style={{ color: "#ff4d4d", marginTop: 0, fontSize: "28px", textTransform: "uppercase", letterSpacing: "1px" }}>
          {title}
        </h1>
        <p style={{ color: "#ccc", marginBottom: "30px", fontSize: "16px" }}>
          {explanation}
        </p>

                {/* Timeline (Only show for transaction scams, not phishing sites) */}
        {dangerType !== "PHISHING_SITE" && (
          <div style={{ 
            margin: "30px 0", 
            display: "flex", 
            flexDirection: "column", 
            gap: "15px",
            textAlign: "left",
            background: "#222",
            padding: "20px",
            borderRadius: "12px"
          }}>
            
            {/* Node 1 */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px", opacity: 0.6 }}>
              <div style={{ width: "40px", height: "40px", background: "#444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📝</div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "12px", color: "#888" }}>NOW</div>
                <div style={{ fontSize: "14px" }}>You click "Sign".</div>
              </div>
            </div>

            <div style={{ borderLeft: "2px dashed #555", height: "15px", marginLeft: "19px" }}></div>

            {/* Node 2: Dynamic Danger */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ width: "40px", height: "40px", background: "#ff4d4d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 0 15px rgba(255, 77, 77, 0.4)" }}>🦠</div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "12px", color: "#ff4d4d" }}>+2 SECONDS (HIDDEN)</div>
                <div style={{ fontSize: "14px" }}>{node2Text}</div>
              </div>
            </div>

            <div style={{ borderLeft: "2px dashed #555", height: "15px", marginLeft: "19px" }}></div>

            {/* Node 3 */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px", opacity: 0.9 }}>
              <div style={{ width: "40px", height: "40px", background: "#8b0000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💸</div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "12px", color: "#8b0000" }}>+10 SECONDS</div>
                <div style={{ fontSize: "14px" }}>Assets stolen. <strong>Balance: $0</strong></div>
              </div>
            </div>

          </div>
        )}

                {/* Google Forms Silent Auto-Submit Button */}
        <a 
          onClick={() => {
            const scamUrl = window.location.href;
            const scamAddress = data?.scamAddress || "Unknown";
            
            // 1. REPLACE YOUR_FORM_ID (the long string of letters/numbers)
            // 2. REPLACE URL_ENTRY_ID (e.g., entry.123456)
            // 3. REPLACE ADDRESS_ENTRY_ID (e.g., entry.789012)
            const formUrl = `https://docs.google.com/forms/d/e/1FAIpQLSdpig73sL8wv_m7L239K33WBoEUFdPO2jmRDd1shMIUm2q7XQ/formResponse?entry.1585420986=${encodeURIComponent(scamUrl)}&entry.865268458=${encodeURIComponent(scamAddress)}&submit=Submit`;
            
            window.open(formUrl, "_blank");
          }}
          style={{
            display: "block",
            width: "100%",
            background: "transparent",
            color: "#ff4d4d",
            border: "1px solid #ff4d4d",
            padding: "12px",
            fontSize: "14px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            marginBottom: "15px",
            textDecoration: "none",
            boxSizing: "border-box"
          }}
        >
          🚩 Report this Scam to SafeSign
        </a>

                      {/* Dismiss Button */}
        <button 
          onClick={() => {
            // Eject them if it's a phishing site OR a spoofed login site
            if (dangerType === "PHISHING_SITE" || dangerType === "SIWE_SPOOF") {
              // Eject them from the website!
              window.location.href = "https://www.google.com"
            } else {
              // Just close the UI for normal transaction blocks
              setVisible(false)
            }
          }}
          style={{
            width: "100%",
            background: "linear-gradient(45deg, #4CAF50, #45a049)",
            color: "white",
            border: "none",
            padding: "15px",
            fontSize: "16px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}
        >
          {dangerType === "PHISHING_SITE" || dangerType === "SIWE_SPOOF" ? "🚪 Escape to Safety" : "I Understand, Dismiss"}
        </button>
      </div>
    </div>
  )
}

export default WarningOverlay