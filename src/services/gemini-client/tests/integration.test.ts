import {
  GeminiClient,
  GeminiConfig,
  TextProcessingRequest,
} from "@/services/gemini-client";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Google GenAI module
vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
}));

describe("Gemini Integration", () => {
  let client: GeminiClient;

  beforeEach(() => {
    const config: GeminiConfig = {
      apiKey: "test-api-key",
      model: "gemini-1.5-flash",
      maxOutputTokens: 1000,
      temperature: 0.7,
    };

    client = new GeminiClient(config);
  });

  describe("End-to-End Text Processing", () => {
    it("should process text refinement request successfully", async () => {
      const request: TextProcessingRequest = {
        prompt: "이 텍스트를 정제해주세요.\n\nBusiness document",
        type: "refine",
      };

      const mockResponse = {
        text: "이 텍스트를 정제하여 더욱 명확하고 읽기 쉽게 만들었습니다.",
        usageMetadata: { totalTokenCount: 45 },
      };

      // Mock the generateContent response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ai.models.generateContent = vi
        .fn()
        .mockResolvedValue(mockResponse);

      const result = await client.processText(request);

      expect(result.success).toBe(true);
      expect(result.processedText).toBe(mockResponse.text);
      expect(result.processingType).toBe("refine");
      expect(result.metadata?.tokensUsed).toBe(45);
    });

    it("should process feedback request successfully", async () => {
      const request: TextProcessingRequest = {
        prompt: "피드백을 요청하는 문서입니다.",
        type: "feedback",
      };

      const mockResponse = {
        text: "문서가 전반적으로 잘 작성되었습니다. 구조가 명확하고 내용이 이해하기 쉽습니다.",
        usageMetadata: { totalTokenCount: 35 },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ai.models.generateContent = vi
        .fn()
        .mockResolvedValue(mockResponse);

      const result = await client.processText(request);

      expect(result.success).toBe(true);
      expect(result.processedText).toBe(mockResponse.text);
      expect(result.processingType).toBe("feedback");
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      const request: TextProcessingRequest = {
        prompt: "Test text",
        type: "refine",
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ai.models.generateContent = vi
        .fn()
        .mockRejectedValue(new Error("API quota exceeded"));

      const result = await client.processText(request);

      expect(result.success).toBe(false);
      expect(result.processedText).toBe("");
      expect(result.originalText).toBe(request.prompt);
    });
  });
});
