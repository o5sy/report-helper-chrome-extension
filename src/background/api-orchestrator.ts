import {
  AnswerRefiner,
  BatchRefinementOptions,
  BatchRefinementResult,
} from '@/services/answer-refiner';
import type {
  BatchFeedbackOptions,
  BatchFeedbackResult,
} from '@/services/feedback-generator';

import { FeedbackGenerator } from '@/services/feedback-generator';
import { GeminiClient } from '@/services/gemini-client';
import { GoogleServiceFactory } from '@/services/google-service-factory';
import { ReferenceStoreService, SyncResult } from '@/services/reference-store';

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
            errors: ['Gemini API key not configured'],
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
          error instanceof Error ? error.message : 'Unknown error occurred',
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
            errors: ['Gemini API key not configured'],
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
          error instanceof Error ? error.message : 'Unknown error occurred',
        ],
      };
    }
  }

  async syncReference(urlsText: string): Promise<SyncResult> {
    try {
      const geminiApiKey = await this.getGeminiApiKey();
      if (!geminiApiKey) {
        return { success: false, error: 'Gemini API key not configured' };
      }

      const referenceStore = new ReferenceStoreService();
      const geminiClient = new GeminiClient({ apiKey: geminiApiKey });
      const sheetsService = GoogleServiceFactory.getSheetsService();

      return await referenceStore.syncFromUrls(urlsText, sheetsService, geminiClient);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // TODO 데이터 접근 계층 별도로 분리
  private async getGeminiApiKey(): Promise<string | null> {
    try {
      // Get API key from Chrome storage
      const result = await globalThis.chrome?.storage?.local?.get([
        'geminiApiKey',
      ]);
      return result?.geminiApiKey || null;
    } catch (error) {
      console.error('Failed to get Gemini API key:', error);
      return null;
    }
  }
}
