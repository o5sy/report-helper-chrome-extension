import type {
  BatchFeedbackOptions,
  BatchFeedbackResult,
  BatchRefinementOptions,
  BatchRefinementResult,
  StorageResult,
} from "../types";

import { AnswerRefiner } from "../services/answer-refiner";
import { FeedbackGenerator } from "../services/feedback-generator";
import { GeminiClient } from "../services/gemini-client";
import { GoogleAuthService } from "../services/google-auth";
import { GoogleSheetsService } from "../services/google-sheets";

export interface ReportRequest {
  url: string;
  content: string;
  title?: string;
}

export interface ProcessedReport {
  reportId: string;
  url: string;
  content: string;
  processedContent?: string;
  timestamp: number;
}

export class ApiOrchestrator {
  private answerRefiner?: AnswerRefiner;
  private feedbackGenerator?: FeedbackGenerator;

  async processReportRequest(request: ReportRequest): Promise<StorageResult> {
    try {
      // Validate input
      if (!request.url || !request.content) {
        return {
          success: false,
          error: "URL and content are required",
        };
      }

      // TODO: 실제 Gemini AI API 호출
      const processedContent = await this.processWithGemini(request.content);

      const report: ProcessedReport = {
        reportId: this.generateReportId(),
        url: request.url,
        content: request.content,
        processedContent,
        timestamp: Date.now(),
      };

      return {
        success: true,
        data: report,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process report",
      };
    }
  }

  async syncToSheets(data: ProcessedReport): Promise<StorageResult> {
    try {
      // TODO: 실제 Google Sheets API 호출
      await this.saveToGoogleSheets(data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to sync to sheets",
      };
    }
  }

  async processWorkflow(request: ReportRequest): Promise<StorageResult> {
    try {
      // 1. Process with Gemini
      const processResult = await this.processReportRequest(request);
      if (!processResult.success) {
        return processResult;
      }

      // 2. Sync to Google Sheets
      const syncResult = await this.syncToSheets(
        processResult.data as ProcessedReport
      );
      if (!syncResult.success) {
        return syncResult;
      }

      return {
        success: true,
        data: processResult.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Workflow failed",
      };
    }
  }

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
    options: BatchFeedbackOptions & { apiKey: string }
  ): Promise<BatchFeedbackResult> {
    try {
      if (!this.feedbackGenerator) {
        this.feedbackGenerator = new FeedbackGenerator({
          apiKey: options.apiKey,
          model: "gemini-2.0-flash",
          maxOutputTokens: 1000,
          temperature: 0.7,
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

  private async processWithGemini(content: string): Promise<string> {
    // TODO: 실제 Gemini API 구현
    // 현재는 mock 데이터 반환
    return `Processed: ${content.slice(0, 100)}...`;
  }

  private async saveToGoogleSheets(data: ProcessedReport): Promise<void> {
    // TODO: 실제 Google Sheets API 구현
    // 현재는 mock 구현
    console.log("Saving to Google Sheets:", data.reportId);
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
