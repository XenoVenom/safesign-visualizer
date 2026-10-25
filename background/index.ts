// This runs invisibly in the background and updates the badge when you switch tabs

// Function to check the active tab and set the badge
const updateBadge = async (tabId: number) => {
  try {
    const tab = await chrome.tabs.get(tabId)
    const url = tab.url || ""
    const isLocalhost = url.includes("localhost") || url.includes("127.0.0.1")

    if (isLocalhost) {
      chrome.action.setBadgeText({ text: "DEV" })
      chrome.action.setBadgeBackgroundColor({ color: "#2196F3" })
        } else {
      // Clear badge for normal sites
      chrome.action.setBadgeText({ text: "" })
    }
  } catch (e) {
    // Ignore errors (e.g. chrome:// pages)
  }
}

// Listen for tab switches
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateBadge(activeInfo.tabId)
})

// Listen for tab URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    // Only update if it's the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id === tabId) {
        updateBadge(tabId)
      }
    })
  }
})