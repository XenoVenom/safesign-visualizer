import { useState } from "react"
import logo from "data-url:./assets/logo.png" // 1. Import your logo

function IndexPopup() {
  const [status, setStatus] = useState("Protection Active")

  return (
    <div style={{
      width: 320,
      height: 400,
      backgroundColor: "#111",
      color: "white",
      display: "flex",
      flexDirection: "column",
      fontFamily: "system-ui, sans-serif",
      overflow: "hidden"
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
          fontSize: "24px",
          boxShadow: "0 0 10px rgba(76, 175, 80, 0.3)",
          overflow: "hidden" // Ensures image doesn't spill out
        }}>
          {/* 2. Replace Emoji with Image */}
          <img src={logo} style={{ width: 28, height: 28, objectFit: "contain" }} alt="Logo" />
        </div>
        
        <div>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>SafeSign Visualizer</h1>
          <div style={{ fontSize: "12px", color: "#888" }}>v1.0.0 • MVP</div>
        </div>
      </div>

      {/* Status Section */}
      <div style={{ padding: "20px", flex: 1 }}>
        
        {/* Protection Status Card */}
        <div style={{
          background: "#1e1e1e",
          border: "1px solid #333",
          borderRadius: "12px",
          padding: "15px",
          marginBottom: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Status</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#4CAF50" }}>
              {status}
            </div>
          </div>
          <div style={{
            width: 10, height: 10,
            background: "#4CAF50",
            borderRadius: "50%",
            boxShadow: "0 0 10px #4CAF50",
            animation: "pulse 2s infinite"
          }}></div>
        </div>

        {/* Features List */}
        <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "20px" }}>
          <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#4CAF50" }}>✓</span> Unlimited Token Approval Block
          </div>
          <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#4CAF50" }}>✓</span> NFT Collection Drain Block
          </div>
          <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#4CAF50" }}>✓</span> Visual Time-Travel Warnings
          </div>
        </div>

        {/* Info Text */}
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          padding: "12px",
          borderRadius: "8px",
          fontSize: "11px",
          color: "#666",
          textAlign: "center"
        }}>
          SafeSign works automatically in the background. You don't need to click anything!
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "15px",
        borderTop: "1px solid #222",
        textAlign: "center"
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
  )
}

export default IndexPopup