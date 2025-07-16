import { beforeEach, describe, expect, it, vi } from "vitest";

import { FeedbackGenerator } from "@/services/feedback-generator";
import type { GeminiConfig } from "@/services/gemini-client";

// Mock the Google GenAI module
vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
}));

describe("FeedbackGenerator", () => {
  let feedbackGenerator: FeedbackGenerator;
  let mockGeminiConfig: GeminiConfig;

  beforeEach(() => {
    mockGeminiConfig = {
      apiKey: "test-api-key",
      model: "gemini-2.0-flash",
      maxOutputTokens: 1000,
      temperature: 0.7,
    };
    feedbackGenerator = new FeedbackGenerator(mockGeminiConfig);
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create instance with valid config", () => {
      expect(feedbackGenerator).toBeDefined();
    });

    it("should throw error with empty API key", () => {
      expect(() => {
        new FeedbackGenerator({ ...mockGeminiConfig, apiKey: "" });
      }).toThrow("API key is required");
    });
  });

  describe("generateBasicFeedback", () => {
    it("should generate feedback for question and answer", async () => {
      const mockResponse = {
        success: true,
        processedText:
          "좋은 답변입니다. 더 구체적인 예시를 추가하면 더 좋겠습니다.",
        originalText: "prompt",
        processingType: "feedback" as const,
        metadata: { tokensUsed: 50, processingTime: 100 },
      };

      // Mock the processText method of GeminiClient
      vi.spyOn(
        feedbackGenerator["geminiClient"],
        "processText"
      ).mockResolvedValue(mockResponse);

      const result = await feedbackGenerator.generateBasicFeedback({
        question: "JavaScript의 장점은 무엇인가요?",
        answer: "JavaScript는 웹 개발에서 널리 사용되는 언어입니다.",
      });

      expect(result.success).toBe(true);
      expect(result.feedback).toBe(mockResponse.processedText);
      expect(result.metadata?.tokensUsed).toBe(50);
      expect(result.isPersonalized).toBe(false);
    });

    it("should handle API errors gracefully", async () => {
      const mockResponse = {
        success: false,
        processedText: "",
        originalText: "prompt",
        processingType: "feedback" as const,
      };

      vi.spyOn(
        feedbackGenerator["geminiClient"],
        "processText"
      ).mockResolvedValue(mockResponse);

      const result = await feedbackGenerator.generateBasicFeedback({
        question: "Test question",
        answer: "Test answer",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Feedback generation failed");
    });

    it("should validate required parameters", async () => {
      const result = await feedbackGenerator.generateBasicFeedback({
        question: "",
        answer: "Test answer",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Question and answer are required");
    });

    it("should generate English feedback", async () => {
      const mockResponse = {
        success: true,
        processedText: "Good answer. Consider adding more specific examples.",
        originalText: "prompt",
        processingType: "feedback" as const,
        metadata: { tokensUsed: 45, processingTime: 90 },
      };

      vi.spyOn(
        feedbackGenerator["geminiClient"],
        "processText"
      ).mockResolvedValue(mockResponse);

      const result = await feedbackGenerator.generateBasicFeedback({
        question: "What are the advantages of JavaScript?",
        answer: "JavaScript is a widely used language in web development.",
      });

      expect(result.success).toBe(true);
      expect(result.feedback).toBe(mockResponse.processedText);
    });
  });
});
