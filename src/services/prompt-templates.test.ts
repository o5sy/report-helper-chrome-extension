import { describe, expect, it } from "vitest";

import { PromptTemplateManager } from "./prompt-templates";

describe("PromptTemplateManager", () => {
  const templateManager = new PromptTemplateManager();

  describe("refine prompts", () => {
    it("should create basic refine prompt", () => {
      const prompt = templateManager.createRefinePrompt({
        text: "Sample text to refine",
        language: "ko",
        style: "formal",
      });

      expect(prompt).toContain("Sample text to refine");
      expect(prompt).toContain("정제하고 개선");
      expect(prompt).toContain("정제된 텍스트:");
    });

    it("should create refine prompt with context", () => {
      const prompt = templateManager.createRefinePrompt({
        text: "Sample text",
        language: "ko",
        style: "formal",
        context: "This is a business report",
      });

      expect(prompt).toContain("컨텍스트: This is a business report");
    });

    it("should create refine prompt with custom rules", () => {
      const prompt = templateManager.createRefinePrompt({
        text: "Sample text",
        language: "ko",
        style: "casual",
        customRules: ["Keep it under 100 words", "Use simple vocabulary"],
      });

      expect(prompt).toContain("Keep it under 100 words");
      expect(prompt).toContain("Use simple vocabulary");
    });
  });

  describe("feedback prompts", () => {
    it("should create basic feedback prompt", () => {
      const prompt = templateManager.createFeedbackPrompt({
        text: "Sample content for feedback",
        language: "ko",
        focusAreas: ["clarity", "structure"],
      });

      expect(prompt).toContain("Sample content for feedback");
      expect(prompt).toContain("피드백을 제공");
      expect(prompt).toContain("명확성");
      expect(prompt).toContain("구조");
    });

    it("should create feedback prompt with specific criteria", () => {
      const prompt = templateManager.createFeedbackPrompt({
        text: "Sample content",
        language: "ko",
        focusAreas: ["grammar", "tone"],
        criteria: {
          grammar: "문법적 정확성을 평가하세요",
          tone: "톤의 일관성을 확인하세요",
        },
      });

      expect(prompt).toContain("문법적 정확성을 평가하세요");
      expect(prompt).toContain("톤의 일관성을 확인하세요");
    });
  });

  describe("template validation", () => {
    it("should validate required parameters", () => {
      expect(() => {
        templateManager.createRefinePrompt({
          text: "",
          language: "ko",
          style: "formal",
        });
      }).toThrow("Text is required");
    });

    it("should validate language parameter", () => {
      expect(() => {
        templateManager.createRefinePrompt({
          text: "Sample text",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          language: "invalid" as any,
          style: "formal",
        });
      }).toThrow("Unsupported language");
    });
  });

  describe("prompt optimization", () => {
    it("should optimize prompt length", () => {
      const longText = "A".repeat(5000);
      const prompt = templateManager.createRefinePrompt({
        text: longText,
        language: "ko",
        style: "formal",
        maxLength: 1000,
      });

      expect(prompt.length).toBeLessThanOrEqual(1500); // Some overhead for template
    });

    it("should include cost optimization settings", () => {
      const prompt = templateManager.createRefinePrompt({
        text: "Sample text",
        language: "ko",
        style: "formal",
        costOptimized: true,
      });

      // Cost optimized prompts should be more concise
      expect(prompt).not.toContain("다음 지침을 자세히 따라주세요");
    });
  });
});
