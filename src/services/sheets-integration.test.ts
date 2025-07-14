import { beforeEach, describe, expect, it, vi } from "vitest";

import { SheetsIntegrationService } from "./sheets-integration";

const mockGoogleSheetsService = {
  getSpreadsheetMetadata: vi.fn(),
  readRange: vi.fn(),
  appendData: vi.fn(),
};

const mockGoogleAuthService = {
  getAccessToken: vi.fn(),
  revokeToken: vi.fn(),
  isAuthenticated: vi.fn(),
};

describe("SheetsIntegrationService", () => {
  let integrationService: SheetsIntegrationService;

  beforeEach(() => {
    integrationService = new SheetsIntegrationService(
      mockGoogleSheetsService,
      mockGoogleAuthService
    );
    vi.clearAllMocks();
  });

  describe("validateSpreadsheetAccess", () => {
    it("should return true when spreadsheet is accessible", async () => {
      mockGoogleSheetsService.getSpreadsheetMetadata.mockResolvedValue({
        success: true,
        data: { spreadsheetId: "test-id", properties: { title: "Test" } },
      });

      const result = await integrationService.validateSpreadsheetAccess(
        "test-id"
      );

      expect(result.success).toBe(true);
      expect(result.canRead).toBe(true);
    });

    it("should return false when spreadsheet is not accessible", async () => {
      mockGoogleSheetsService.getSpreadsheetMetadata.mockResolvedValue({
        success: false,
        error: "Not found",
      });

      const result = await integrationService.validateSpreadsheetAccess(
        "test-id"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Spreadsheet access validation failed: Not found"
      );
    });
  });

  describe("readExistingReport", () => {
    it("should read existing report data successfully", async () => {
      const mockData = {
        success: true,
        data: {
          range: "Sheet1!A1:C3",
          values: [
            ["Date", "URL", "Title"],
            ["2024-01-01", "https://example.com", "Example Title"],
          ],
        },
      };

      mockGoogleSheetsService.readRange.mockResolvedValue(mockData);

      const result = await integrationService.readExistingReport(
        "test-id",
        "Sheet1!A1:C10"
      );

      expect(result.success).toBe(true);
      expect(result.data?.headers).toEqual(["Date", "URL", "Title"]);
      expect(result.data?.rows).toHaveLength(1);
      expect(result.data?.rows?.[0]).toEqual([
        "2024-01-01",
        "https://example.com",
        "Example Title",
      ]);
    });

    it("should handle empty spreadsheet gracefully", async () => {
      mockGoogleSheetsService.readRange.mockResolvedValue({
        success: true,
        data: { range: "Sheet1!A1:C10" },
      });

      const result = await integrationService.readExistingReport(
        "test-id",
        "Sheet1!A1:C10"
      );

      expect(result.success).toBe(true);
      expect(result.data?.headers).toEqual([]);
      expect(result.data?.rows).toEqual([]);
    });

    it("should return error when reading fails", async () => {
      mockGoogleSheetsService.readRange.mockResolvedValue({
        success: false,
        error: "Read failed",
      });

      const result = await integrationService.readExistingReport(
        "test-id",
        "Sheet1!A1:C10"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to read existing report: Read failed");
    });
  });

  describe("ensureDataIntegrity", () => {
    it("should validate that new data does not overwrite existing data", async () => {
      const existingData = [
        ["Date", "URL", "Title"],
        ["2024-01-01", "https://example.com", "Existing"],
      ];

      const newData = [["2024-01-02", "https://new.com", "New Entry"]];

      const result = integrationService.ensureDataIntegrity(
        existingData,
        newData
      );

      expect(result.isValid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it("should detect conflicts when new data would overwrite existing data", async () => {
      const existingData = [
        ["Date", "URL", "Title"],
        ["2024-01-01", "https://example.com", "Existing"],
      ];

      const newData = [["2024-01-01", "https://example.com", "Modified Title"]];

      const result = integrationService.ensureDataIntegrity(
        existingData,
        newData
      );

      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]).toContain("2024-01-01");
    });
  });
});
