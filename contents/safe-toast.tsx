import type { PlasmoCSConfig } from "plasmo"
import { useState, useEffect } from "react"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
}

const SafeToast = () => {
  const [visible, setVisible] = useState(false)
  const [method, setMethod] = useState("")

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "SAFESIGN_SAFE") {
        setMethod(event.data.payload.method || "Transaction")
        setVisible(true)
        
        // Auto-hide after 2.5 seconds
        setTimeout(() => {
          setVisible(false)
        }, 2500)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "linear-gradient(145deg, #2e7d32, #1b5e20)",
      color: "white",
      padding: "15px 25px",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      zIndex: 2147483647,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      fontWeight: "500",
      animation: "slideIn 0.3s ease-out"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.2)",
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px"
      }}>✓</div>
      
      <div>
        <div style={{ opacity: 0.9, fontSize: "12px" }}>SafeSign Verified</div>
        <div style={{ fontSize: "16px" }}>Transaction Safe</div>
      </div>
    </div>
  )
}

export default SafeToast