import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiOrchestrator } from "./api-orchestrator";

describe("ApiOrchestrator", () => {
  let apiOrchestrator: ApiOrchestrator;

  beforeEach(() => {
    apiOrchestrator = new ApiOrchestrator();
    vi.clearAllMocks();
  });

  describe("processReportRequest", () => {
    it("should process report request successfully", async () => {
      const request = {
        url: "https://example.com",
        content: "test content",
      };

      const result = await apiOrchestrator.processReportRequest(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should handle API errors gracefully", async () => {
      const request = {
        url: "",
        content: "",
      };

      const result = await apiOrchestrator.processReportRequest(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("syncToSheets", () => {
    it("should sync data to Google Sheets", async () => {
      const data = {
        reportId: "test-123",
        url: "https://example.com",
        content: "processed content",
      };

      const result = await apiOrchestrator.syncToSheets(data);

      expect(result.success).toBe(true);
    });
  });
});
