import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiOrchestrator } from "./api-orchestrator";

// Mock the services
vi.mock("../services/answer-refiner", () => ({
  AnswerRefiner: vi.fn().mockImplementation(() => ({
    processBatchRefinement: vi.fn(),
  })),
}));

vi.mock("../services/gemini-client", () => ({
  GeminiClient: vi.fn(),
}));

vi.mock("../services/google-sheets", () => ({
  GoogleSheetsService: vi.fn(),
}));

vi.mock("../services/google-auth", () => ({
  GoogleAuthService: vi.fn(),
}));

describe("ApiOrchestrator", () => {
  let apiOrchestrator: ApiOrchestrator;

  beforeEach(() => {
    vi.clearAllMocks();
    apiOrchestrator = new ApiOrchestrator();
  });

  describe("processReportRequest", () => {
    it("should process a valid report request", async () => {
      const request = {
        url: "https://example.com",
        content: "Test content",
        title: "Test Report",
      };

      const result = await apiOrchestrator.processReportRequest(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should fail with invalid input", async () => {
      const request = {
        url: "",
        content: "",
      };

      const result = await apiOrchestrator.processReportRequest(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain("URL and content are required");
    });
  });

  describe("syncToSheets", () => {
    it("should sync data to sheets", async () => {
      const data = {
        reportId: "test-id",
        url: "https://example.com",
        content: "test content",
        timestamp: Date.now(),
      };

      const result = await apiOrchestrator.syncToSheets(data);

      expect(result.success).toBe(true);
    });
  });
});
