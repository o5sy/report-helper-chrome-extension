import { beforeEach, describe, expect, it, vi } from "vitest";

import { SheetDetector } from "@/services/sheet-detector";

// Mock chrome runtime
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
  },
};

describe("SheetDetector", () => {
  let detector: SheetDetector;

  beforeEach(() => {
    vi.clearAllMocks();
    detector = new SheetDetector();

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        href: "https://docs.google.com/spreadsheets/d/1234567890/edit#gid=0",
        pathname: "/spreadsheets/d/1234567890/edit",
      },
      writable: true,
    });

    // Mock document.title
    Object.defineProperty(document, "title", {
      value: "Test Sheet - Google Sheets",
      writable: true,
    });
  });

  describe("extractSpreadsheetId", () => {
    it("should extract spreadsheet ID from Google Sheets URL", () => {
      const id = detector.extractSpreadsheetId();
      expect(id).toBe("1234567890");
    });

    it("should return null for non-Google Sheets URLs", () => {
      Object.defineProperty(window, "location", {
        value: {
          href: "https://example.com",
          pathname: "/some-path",
        },
        writable: true,
      });

      const id = detector.extractSpreadsheetId();
      expect(id).toBeNull();
    });
  });

  describe("extractSheetName", () => {
    it("should extract sheet name from document title", () => {
      const name = detector.extractSheetName();
      expect(name).toBe("Test Sheet");
    });

    it("should return fallback name for invalid title", () => {
      Object.defineProperty(document, "title", {
        value: "Invalid Title",
        writable: true,
      });

      const name = detector.extractSheetName();
      expect(name).toBe("Untitled Spreadsheet");
    });
  });

  describe("getSheetInfo", () => {
    it("should return complete sheet information", () => {
      const info = detector.getSheetInfo();

      expect(info).toEqual({
        spreadsheetId: "1234567890",
        sheetName: "Test Sheet",
        url: "https://docs.google.com/spreadsheets/d/1234567890/edit#gid=0",
      });
    });
  });

  describe("sendSheetInfoToBackground", () => {
    it("should send sheet info to background script", () => {
      detector.sendSheetInfoToBackground();

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: "SHEET_INFO_DETECTED",
        data: {
          spreadsheetId: "1234567890",
          sheetName: "Test Sheet",
          url: "https://docs.google.com/spreadsheets/d/1234567890/edit#gid=0",
        },
      });
    });
  });

  describe("isGoogleSheetsPage", () => {
    it("should return true for Google Sheets URLs", () => {
      expect(detector.isGoogleSheetsPage()).toBe(true);
    });

    it("should return false for non-Google Sheets URLs", () => {
      Object.defineProperty(window, "location", {
        value: {
          href: "https://example.com",
          pathname: "/some-path",
        },
        writable: true,
      });

      expect(detector.isGoogleSheetsPage()).toBe(false);
    });
  });
});
