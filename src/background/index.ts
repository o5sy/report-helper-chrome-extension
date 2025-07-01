// Background Service Worker for Report Generator Extension
console.log("Report Generator background service worker loaded");

// Extension installed event
chrome.runtime.onInstalled.addListener(() => {
  console.log("Report Generator extension installed successfully");
});
