import type { PlasmoCSConfig } from "plasmo"
import { useState, useEffect } from "react"
import dangerLogo from "data-url:../assets/shield-danger.png"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
}

const WarningOverlay = () => {
  const [visible, setVisible] = useState(false)
  const [dangerType, setDangerType] = useState("UNKNOWN") // TOKEN_DRAIN or NFT_DRAIN

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "SAFESIGN_ALERT") {
        setDangerType(event.data.payload.dangerType || "UNKNOWN")
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
        
        <div style={{ marginBottom: "10px" }}>
         <img src={dangerLogo} style={{ width: 60, height: 60 }} alt="Shield" />
        </div>
        <h1 style={{ color: "#ff4d4d", marginTop: 0, fontSize: "28px", textTransform: "uppercase", letterSpacing: "1px" }}>
          {title}
        </h1>
        <p style={{ color: "#ccc", marginBottom: "30px", fontSize: "16px" }}>
          {explanation}
        </p>

        {/* Timeline */}
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

        <button 
          onClick={() => setVisible(false)}
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
          I Understand, Dismiss
        </button>
      </div>
    </div>
  )
}

export default WarningOverlay