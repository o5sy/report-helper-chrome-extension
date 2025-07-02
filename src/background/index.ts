// Background Service Worker for Report Generator Extension
/// <reference types="chrome"/>
import { MessageHandler } from "./message-handler";
import { ServiceWorkerManager } from "./service-worker-manager";

console.log("Report Generator background service worker loaded");

const messageHandler = new MessageHandler();
const serviceWorkerManager = new ServiceWorkerManager();

// Initialize service worker
serviceWorkerManager.initialize();

// Extension installed event
chrome.runtime.onInstalled.addListener(() => {
  console.log("Report Generator extension installed successfully");
});

// Message listener for communication with content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  messageHandler
    .handleMessage(message, sender)
    .then((response) => {
      sendResponse(response);
    })
    .catch((error) => {
      sendResponse({
        success: false,
        type: "ERROR_RESPONSE",
        error: error.message || "Unknown error",
      });
    });

  // Return true to indicate we will respond asynchronously
  return true;
});

// Keep service worker alive
chrome.runtime.onConnect.addListener(() => {
  // Keep connection alive
});

// Process work queue periodically
setInterval(() => {
  serviceWorkerManager
    .processQueue()
    .then((result) => {
      if (!result.success) {
        console.error("Failed to process queue:", result.error);
      }
    })
    .catch((error) => {
      console.error("Queue processing error:", error);
    });
}, 30000); // Every 30 seconds
