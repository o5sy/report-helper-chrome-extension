import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthResult } from "@/services/google-auth";
import { GoogleSheetsService } from "@/services/google-sheets";

const mockGoogleAuthService = {
  getAccessToken: vi.fn(),
  revokeToken: vi.fn(),
  isAuthenticated: vi.fn(),
};

// Mock fetch
const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

describe("GoogleSheetsService", () => {
  let sheetsService: GoogleSheetsService;

  beforeEach(() => {
    sheetsService = new GoogleSheetsService(mockGoogleAuthService);
    vi.clearAllMocks();
  });

  describe("getSpreadsheetMetadata", () => {
    it("should return spreadsheet metadata when API call succeeds", async () => {
      const mockToken = "mock-access-token";
      const mockMetadata = {
        spreadsheetId: "test-sheet-id",
        properties: { title: "Test Sheet" },
        sheets: [{ properties: { title: "Sheet1" } }],
      };

      mockGoogleAuthService.getAccessToken.mockResolvedValue({
        success: true,
        token: mockToken,
      } as AuthResult);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMetadata),
      });

      const result = await sheetsService.getSpreadsheetMetadata(
        "test-sheet-id"
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMetadata);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "https://sheets.googleapis.com/v4/spreadsheets/test-sheet-id"
        ),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
    });

    it("should return error when authentication fails", async () => {
      mockGoogleAuthService.getAccessToken.mockResolvedValue({
        success: false,
        error: "Auth failed",
      } as AuthResult);

      const result = await sheetsService.getSpreadsheetMetadata(
        "test-sheet-id"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentication failed: Auth failed");
    });

    it("should return error when API call fails", async () => {
      mockGoogleAuthService.getAccessToken.mockResolvedValue({
        success: true,
        token: "mock-token",
      } as AuthResult);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      const result = await sheetsService.getSpreadsheetMetadata(
        "test-sheet-id"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("API request failed: 404 Not Found");
    });
  });

  describe("readRange", () => {
    it("should return range data when read succeeds", async () => {
      const mockToken = "mock-access-token";
      const mockRangeData = {
        range: "Sheet1!A1:C3",
        values: [
          ["Header1", "Header2", "Header3"],
          ["Value1", "Value2", "Value3"],
          ["Value4", "Value5", "Value6"],
        ],
      };

      mockGoogleAuthService.getAccessToken.mockResolvedValue({
        success: true,
        token: mockToken,
      } as AuthResult);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRangeData),
      });

      const result = await sheetsService.readRange(
        "test-sheet-id",
        "Sheet1!A1:C3"
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRangeData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("test-sheet-id/values/Sheet1!A1:C3"),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
    });

    it("should handle empty range gracefully", async () => {
      mockGoogleAuthService.getAccessToken.mockResolvedValue({
        success: true,
        token: "mock-token",
      } as AuthResult);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ range: "Sheet1!A1:C3" }),
      });

      const result = await sheetsService.readRange(
        "test-sheet-id",
        "Sheet1!A1:C3"
      );

      expect(result.success).toBe(true);
      expect(result.data?.values).toBeUndefined();
    });
  });
});
