import type { GeminiConfig, TextProcessingRequest } from "../types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GeminiClient } from "./gemini-client";

// Mock the Google GenAI module
vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
}));

describe("GeminiClient", () => {
  let client: GeminiClient;
  let config: GeminiConfig;

  beforeEach(() => {
    config = {
      apiKey: "test-api-key",
      model: "gemini-1.5-flash",
      maxOutputTokens: 1000,
      temperature: 0.7,
    };
    client = new GeminiClient(config);
  });

  describe("constructor", () => {
    it("should create instance with valid config", () => {
      expect(client).toBeInstanceOf(GeminiClient);
    });

    it("should throw error with empty API key", () => {
      expect(() => {
        new GeminiClient({ ...config, apiKey: "" });
      }).toThrow("API key is required");
    });
  });

  describe("processText", () => {
    it("should refine text successfully", async () => {
      const request: TextProcessingRequest = {
        prompt: "This is sample text to refine.",
        type: "refine",
      };

      const mockResponse = {
        text: "This is refined sample text with improved clarity.",
        usageMetadata: { totalTokenCount: 25 },
      };

      // Mock the generateContent response
      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ai.models.generateContent = mockGenerateContent;

      const result = await client.processText(request);

      expect(result.success).toBe(true);
      expect(result.processedText).toBe(mockResponse.text);
      expect(result.originalText).toBe(request.prompt);
      expect(result.processingType).toBe("refine");
      expect(result.metadata?.tokensUsed).toBe(25);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it("should generate feedback successfully", async () => {
      const request: TextProcessingRequest = {
        prompt: "This is sample content for feedback.",
        type: "feedback",
      };

      const mockResponse = {
        text: "The content is clear and well-structured. Consider adding more examples.",
        usageMetadata: { totalTokenCount: 30 },
      };

      const mockGenerateContent = vi.fn().mockResolvedValue(mockResponse);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ai.models.generateContent = mockGenerateContent;

      const result = await client.processText(request);

      expect(result.success).toBe(true);
      expect(result.processedText).toBe(mockResponse.text);
      expect(result.processingType).toBe("feedback");
    });

    it("should handle API errors gracefully", async () => {
      const request: TextProcessingRequest = {
        prompt: "Test text",
        type: "refine",
      };

      const mockGenerateContent = vi
        .fn()
        .mockRejectedValue(new Error("API request failed"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ai.models.generateContent = mockGenerateContent;

      const result = await client.processText(request);

      expect(result.success).toBe(false);
      expect(result.processedText).toBe("");
      expect(result.originalText).toBe(request.prompt);
    });
  });
});
