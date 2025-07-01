import { describe, it, expect } from "vitest";
import { ResponseParser } from "./response-parser";
import type { ValidationRule, ResponseParseOptions } from "../types";

describe("ResponseParser", () => {
  const parser = new ResponseParser();

  describe("parseResponse", () => {
    it("should parse valid response successfully", () => {
      const rawResponse = {
        text: "This is a well-written response.",
        usageMetadata: {
          totalTokenCount: 50,
          promptTokenCount: 20,
          candidatesTokenCount: 30,
        },
      };

      const result = parser.parseResponse(rawResponse, {
        validateStructure: true,
      });

      expect(result.isValid).toBe(true);
      expect(result.content).toBe(rawResponse.text);
      expect(result.metadata.tokensUsed).toBe(50);
    });

    it("should handle empty response", () => {
      const rawResponse = {
        text: "",
        usageMetadata: { totalTokenCount: 5 },
      };

      const result = parser.parseResponse(rawResponse);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Response is empty");
    });

    it("should validate response structure", () => {
      const rawResponse = {
        text: "Valid response text",
        usageMetadata: { totalTokenCount: 20 },
      };

      const options: ResponseParseOptions = {
        validateStructure: true,
        customValidators: [
          {
            name: "min-length",
            description: "Response must be at least 10 characters",
            validator: (text: string) => text.length >= 10,
            errorMessage: "Response too short",
            severity: "error",
          },
        ],
      };

      const result = parser.parseResponse(rawResponse, options);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation with custom rules", () => {
      const rawResponse = {
        text: "Short",
        usageMetadata: { totalTokenCount: 10 },
      };

      const options: ResponseParseOptions = {
        validateStructure: true,
        customValidators: [
          {
            name: "min-length",
            description: "Response must be at least 10 characters",
            validator: (text: string) => text.length >= 10,
            errorMessage: "Response too short",
            severity: "error",
          },
        ],
      };

      const result = parser.parseResponse(rawResponse, options);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Response too short");
    });
  });

  describe("calculateQuality", () => {
    it("should provide basic quality metrics for text", () => {
      const text = "This is a sample text for quality calculation.";

      const quality = parser.calculateQuality(text);

      expect(quality.score).toBeGreaterThan(0);
      expect(typeof quality.readability).toBe("number");
      expect(typeof quality.coherence).toBe("number");
      expect(typeof quality.completeness).toBe("number");
      expect(typeof quality.accuracy).toBe("number");
    });

    it("should return zero quality for empty text", () => {
      const text = "";

      const quality = parser.calculateQuality(text);

      expect(quality.score).toBe(0);
      expect(quality.readability).toBe(0);
      expect(quality.coherence).toBe(0);
      expect(quality.completeness).toBe(0);
      expect(quality.accuracy).toBe(0);
    });
  });

  describe("extractMetadata", () => {
    it("should extract metadata from response", () => {
      const rawResponse = {
        text: "Sample response",
        usageMetadata: {
          totalTokenCount: 100,
          promptTokenCount: 40,
          candidatesTokenCount: 60,
        },
      };

      const metadata = parser.extractMetadata(rawResponse, 1500);

      expect(metadata.tokensUsed).toBe(100);
      expect(metadata.promptTokens).toBe(40);
      expect(metadata.completionTokens).toBe(60);
      expect(metadata.processingTime).toBe(1500);
    });

    it("should handle missing usage metadata", () => {
      const rawResponse = {
        text: "Sample response",
      };

      const metadata = parser.extractMetadata(rawResponse, 1000);

      expect(metadata.tokensUsed).toBe(0);
      expect(metadata.processingTime).toBe(1000);
    });
  });

  describe("validateText", () => {
    it("should validate text with built-in rules", () => {
      const validationResult = parser.validateText("This is a valid response.");

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });

    it("should detect empty text", () => {
      const validationResult = parser.validateText("");

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors).toContain("Response is empty");
    });

    it("should detect too short text", () => {
      const validationResult = parser.validateText("Hi");

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors).toContain("Response is too short");
    });

    it("should apply custom validation rules", () => {
      const customRules: ValidationRule[] = [
        {
          name: "no-numbers",
          description: "Text should not contain numbers",
          validator: (text: string) => !/\d/.test(text),
          errorMessage: "Text contains numbers",
          severity: "warning",
        },
      ];

      const validationResult = parser.validateText(
        "This text has 123 numbers",
        customRules
      );

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors).toContain("Text contains numbers");
    });
  });
});
