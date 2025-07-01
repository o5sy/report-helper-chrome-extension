import type {
  ProcessedResponse,
  QualityMetrics,
  ResponseMetadata,
  ResponseParseOptions,
  ValidationRule,
} from "../types";

interface RawGeminiResponse {
  text?: string;
  usageMetadata?: {
    totalTokenCount?: number;
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ResponseParser {
  private readonly DEFAULT_MIN_LENGTH = 3;

  parseResponse(
    rawResponse: RawGeminiResponse,
    options: ResponseParseOptions = {}
  ): ProcessedResponse {
    const startTime = Date.now();
    const content = rawResponse.text || "";

    // Extract metadata
    const metadata = this.extractMetadata(rawResponse, Date.now() - startTime);

    // Validate response
    let isValid = true;
    let errors: string[] = [];

    if (options.validateStructure !== false) {
      const validation = this.validateText(content, options.customValidators);
      isValid = validation.isValid;
      errors = validation.errors;
    }

    // Simple quality metrics
    const quality = this.getBasicQuality(content);

    return {
      content,
      quality,
      metadata,
      isValid,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  extractMetadata(
    rawResponse: RawGeminiResponse,
    processingTime: number
  ): ResponseMetadata {
    const usageMetadata = rawResponse.usageMetadata || {};

    return {
      processingTime,
      tokensUsed: usageMetadata.totalTokenCount || 0,
      modelUsed: "gemini-1.5-flash",
      promptTokens: usageMetadata.promptTokenCount,
      completionTokens: usageMetadata.candidatesTokenCount,
    };
  }

  validateText(
    text: string,
    customValidators?: ValidationRule[]
  ): ValidationResult {
    const errors: string[] = [];

    // Basic validation rules
    if (!text || text.trim().length === 0) {
      errors.push("Response is empty");
    } else if (text.trim().length < this.DEFAULT_MIN_LENGTH) {
      errors.push("Response is too short");
    }

    // Apply custom validators
    if (customValidators) {
      for (const rule of customValidators) {
        if (!rule.validator(text)) {
          errors.push(rule.errorMessage);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 사용자가 품질 검증을 직접 하므로 단순한 메트릭만 제공
  calculateQuality(text: string): QualityMetrics {
    return this.getBasicQuality(text);
  }

  private getBasicQuality(text: string): QualityMetrics {
    if (!text || text.trim().length === 0) {
      return {
        score: 0,
        readability: 0,
        coherence: 0,
        completeness: 0,
        accuracy: 0,
      };
    }

    // 기본적인 점수만 제공 (실제 품질은 사용자가 판단)
    const hasContent = text.length > 10;
    const baseScore = hasContent ? 80 : 30;

    return {
      score: baseScore,
      readability: baseScore,
      coherence: baseScore,
      completeness: text.length > 20 ? baseScore : 50,
      accuracy: baseScore,
    };
  }
}
