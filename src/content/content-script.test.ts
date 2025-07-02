import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Chrome API
const mockChrome = {
  runtime: {
    sendMessage: vi.fn().mockResolvedValue({ success: true }),
  },
};

// @ts-expect-error - Mocking chrome for testing
(globalThis as any).chrome = mockChrome;

describe("Content Script Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Google Sheets page
    Object.defineProperty(window, "location", {
      value: {
        href: "https://docs.google.com/spreadsheets/d/test123/edit#gid=0",
        hostname: "docs.google.com",
        pathname: "/spreadsheets/d/test123/edit",
      },
      writable: true,
    });

    Object.defineProperty(document, "title", {
      value: "My Test Sheet - Google Sheets",
      writable: true,
    });

    Object.defineProperty(document, "readyState", {
      value: "complete",
      writable: true,
    });
  });

  it("should initialize content script on Google Sheets page", async () => {
    // Import and run content script
    await import("./index");

    // Wait for script to initialize
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Verify that sendMessage was called with sheet info
    expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: "SHEET_INFO_DETECTED",
      data: {
        spreadsheetId: "test123",
        sheetName: "My Test Sheet",
        url: "https://docs.google.com/spreadsheets/d/test123/edit#gid=0",
      },
    });
  });

  it("should not initialize on non-Google Sheets page", async () => {
    // Mock non-Google Sheets page
    Object.defineProperty(window, "location", {
      value: {
        href: "https://example.com",
        hostname: "example.com",
        pathname: "/some-page",
      },
      writable: true,
    });

    // Clear previous calls
    vi.clearAllMocks();

    // Import content script
    await import("./index");

    // Wait
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Verify sendMessage was not called
    expect(mockChrome.runtime.sendMessage).not.toHaveBeenCalled();
  });
});
