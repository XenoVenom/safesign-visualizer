import { useState, useEffect } from "react"
import logo from "data-url:./assets/logo.png"
import iconActiveUrl from "data-url:./assets/icon.png"
import iconPausedUrl from "data-url:./assets/icon-paused.png"

// Helper: Convert base64 URL to ImageData
const setIconData = async (dataUrl: string) => {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 48
      canvas.height = 48
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 48, 48)
      const imageData = ctx.getImageData(0, 0, 48, 48)
      chrome.action.setIcon({ imageData: imageData })
      resolve()
    }
    img.src = dataUrl
  })
}

function IndexPopup() {
  const [isPaused, setIsPaused] = useState(false)

  // Load the saved state when popup opens
  useEffect(() => {
    chrome.storage.local.get("safesign_paused", (result) => {
      const paused = result.safesign_paused === true
      setIsPaused(paused)
      setIconData(paused ? iconPausedUrl : iconActiveUrl)
    })
  }, [])

  // Toggle the state
  const toggleProtection = async () => {
    const newstate = !isPaused
    setIsPaused(newstate)
    chrome.storage.local.set({ safesign_paused: newstate })
    setIconData(newstate ? iconPausedUrl : iconActiveUrl)
  }

  return (
    <>
      {/* Style to fix Chrome's white plate */}
      <style>{`
        html, body, #__plasmo {
          background-color: #121212 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
      
      <div style={{
        width: 320,
        height: 580,
        backgroundColor: "#121212",
        color: "white",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden",
        border: "3px solid #2a2a2a",
        boxSizing: "border-box"
      }}>
        
        {/* Header */}
        <div style={{
          padding: "20px",
          background: "linear-gradient(145deg, #1a1a1a, #222)",
          borderBottom: "1px solid #333",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: 40, height: 40,
            background: "#4CAF50",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}>
            <img src={logo} style={{ width: 28, height: 28, objectFit: "contain" }} alt="Logo" />
          </div>
          
          <div>
            <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>SafeSign Visualizer</h1>
            <div style={{ fontSize: "12px", color: "#888" }}>v1.4.0</div>
          </div>
        </div>

        {/* Status Section */}
        <div style={{ padding: "20px", flex: 1 }}>
          
          {/* Sleek Toggle Switch */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "20px",
            padding: "15px",
            background: "#1e1e1e",
            borderRadius: "12px",
            border: "1px solid #333"
          }}>
            <span style={{ 
              fontSize: "14px", 
              color: isPaused ? "#666" : "#4CAF50", 
              fontWeight: "bold",
              width: "50px",
              textAlign: "right"
            }}>
              {isPaused ? "Paused" : "Active"}
            </span>
            
            {/* The Toggle Track */}
            <div 
              onClick={toggleProtection}
              style={{
                width: "50px",
                height: "28px",
                background: isPaused ? "#444" : "#4CAF50",
                borderRadius: "14px",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.3s ease",
                flexShrink: 0
              }}
            >
              {/* The Toggle Knob */}
              <div style={{
                position: "absolute",
                top: "3px",
                left: isPaused ? "3px" : "25px",
                width: "22px",
                height: "22px",
                background: "white",
                borderRadius: "50%",
                transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }} />
            </div>
          </div>

          {/* Info Text / Warning */}
          <div style={{
            background: isPaused ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.05)",
            border: isPaused ? "1px solid rgba(255, 0, 0, 0.3)" : "none",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "11px",
            color: isPaused ? "#ff4d4d" : "#666",
            textAlign: "center",
            marginBottom: "20px",
            fontWeight: isPaused ? "bold" : "normal",
            transition: "all 0.3s ease"
          }}>
            {isPaused ? "⚠️ WARNING: SafeSign is paused. Your wallet is vulnerable to scams." : "SafeSign works automatically in the background. You don't need to click anything!"}
          </div>

          {/* Features List */}
          <div style={{ fontSize: "13px", color: "#aaa" }}>
            <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span> Unlimited Token Approval Block
            </div>
            <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span> NFT Collection Drain Block
            </div>
            <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span> Gasless Permit Drain Block
            </div>
            <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span> Proactive Phishing Website Blocker
            </div>
            <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span> Spoofed Login Detector (SIWE)
            </div>
            <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span> Community Blacklist & Reporting
            </div>
            <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span> Visual Time-Travel Warnings
            </div>
            <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span> Start/Pause Protection Toggle
            </div>
            <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span> Power User Technical Decoder
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "15px",
          borderTop: "1px solid #222",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "5px"
        }}>
          
          {/* GitHub Link */}
          <div 
            onClick={() => chrome.tabs.create({ url: "https://github.com/XenoVenom/safesign-visualizer" })}
            style={{ color: "#4CAF50", textDecoration: "none", fontSize: "12px", cursor: "pointer" }}
          >
            View Source Code on GitHub
          </div>

          {/* Report Scam Link */}
          <div 
            onClick={() => chrome.tabs.create({ url: "https://forms.gle/dkBuRXhUrFiSfkEF7" })}
            style={{ color: "#ff4d4d", textDecoration: "none", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
          >
            🚩 Report a Scam
          </div>
          
        </div>
      </div>
    </>
  )
}

export default IndexPopup