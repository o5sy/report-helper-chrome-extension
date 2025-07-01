// Content Script for Report Generator Extension
console.log("Report Generator content script loaded on:", window.location.href);

// Basic content script functionality
const init = () => {
  console.log("Content script initialized");
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
