/// <reference types="chrome"/>
import { MessageHandler } from "./message-handler/message-handler";

console.log("Report Generator background service worker loaded");

const messageHandler = new MessageHandler();

// Extension installed event
chrome.runtime.onInstalled.addListener(() => {
  console.log("Report Generator extension installed successfully");
});

// Message listener for communication with content scripts and popup
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  messageHandler
    .handleMessage(message)
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
