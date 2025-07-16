import {
  AnswerRefiner,
  BatchRefinementOptions,
  BatchRefinementResult,
} from "@/services/answer-refiner";
import type {
  BatchFeedbackOptions,
  BatchFeedbackResult,
} from "@/services/feedback-generator";

import { FeedbackGenerator } from "@/services/feedback-generator";

export class ApiOrchestrator {
  private answerRefiner?: AnswerRefiner;
  private feedbackGenerator?: FeedbackGenerator;

  async refineAnswers(
    options: BatchRefinementOptions
  ): Promise<BatchRefinementResult> {
    try {
      if (!this.answerRefiner) {
        const geminiApiKey = await this.getGeminiApiKey();
        if (!geminiApiKey) {
          return {
            success: false,
            processedCount: 0,
            successCount: 0,
            errorCount: 1,
            errors: ["Gemini API key not configured"],
          };
        }

        this.answerRefiner = new AnswerRefiner({
          apiKey: geminiApiKey,
        });
      }

      return await this.answerRefiner.processBatchRefinement(options);
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        successCount: 0,
        errorCount: 1,
        errors: [
          error instanceof Error ? error.message : "Unknown error occurred",
        ],
      };
    }
  }

  async generateFeedback(
    options: BatchFeedbackOptions
  ): Promise<BatchFeedbackResult> {
    try {
      if (!this.feedbackGenerator) {
        const geminiApiKey = await this.getGeminiApiKey();
        if (!geminiApiKey) {
          return {
            success: false,
            processedCount: 0,
            successCount: 0,
            errorCount: 1,
            errors: ["Gemini API key not configured"],
          };
        }

        this.feedbackGenerator = new FeedbackGenerator({
          apiKey: geminiApiKey,
        });
      }

      const batchOptions: BatchFeedbackOptions = {
        spreadsheetId: options.spreadsheetId,
        sourceRange: options.sourceRange,
        targetRange: options.targetRange,
      };

      return await this.feedbackGenerator.generateBatchFeedback(batchOptions);
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        successCount: 0,
        errorCount: 1,
        errors: [
          error instanceof Error ? error.message : "Unknown error occurred",
        ],
      };
    }
  }

  // TODO 데이터 접근 계층 별도로 분리
  private async getGeminiApiKey(): Promise<string | null> {
    try {
      // Get API key from Chrome storage
      const result = await globalThis.chrome?.storage?.sync?.get([
        "geminiApiKey",
      ]);
      return result?.geminiApiKey || null;
    } catch (error) {
      console.error("Failed to get Gemini API key:", error);
      return null;
    }
  }
}
