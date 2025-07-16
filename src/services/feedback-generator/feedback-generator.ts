import {
  BasicFeedbackRequest,
  BatchFeedbackOptions,
  BatchFeedbackResult,
  FeedbackResult,
} from "./types";
import { GeminiClient, GeminiConfig } from "@/services/gemini-client";

import { GoogleServiceFactory } from "@/services/google-service-factory";
import { GoogleSheetsService } from "@/services/google-sheets";

export class FeedbackGenerator {
  private geminiClient: GeminiClient;
  private sheetsService: GoogleSheetsService;

  constructor(config: GeminiConfig) {
    if (!config.apiKey || config.apiKey.trim() === "") {
      throw new Error("API key is required");
    }
    this.geminiClient = new GeminiClient(config);
    this.sheetsService = GoogleServiceFactory.getSheetsService();
  }

  async generateBasicFeedback(
    request: BasicFeedbackRequest
  ): Promise<FeedbackResult> {
    const startTime = Date.now();

    try {
      if (!request.question?.trim() || !request.answer?.trim()) {
        return {
          success: false,
          error: "Question and answer are required",
        };
      }

      const prompt = this.buildFeedbackPrompt(request);

      const response = await this.geminiClient.processText({
        type: "feedback",
        prompt,
      });

      if (!response.success) {
        return {
          success: false,
          error: `Feedback generation failed: ${
            response.processedText || "Unknown error"
          }`,
        };
      }

      return {
        success: true,
        feedback: response.processedText,
        isPersonalized: false,
        metadata: {
          tokensUsed: response.metadata?.tokensUsed || 0,
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Feedback generation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        metadata: {
          processingTime: Date.now() - startTime,
        },
      };
    }
  }

  async generateBatchFeedback(
    options: BatchFeedbackOptions
  ): Promise<BatchFeedbackResult> {
    try {
      // Read existing data
      const readQuestionResult = await this.sheetsService.readRange(
        options.spreadsheetId,
        options.sourceRange.questionRange
      );

      const readAnswerResult = await this.sheetsService.readRange(
        options.spreadsheetId,
        options.sourceRange.answerRange
      );

      if (!readQuestionResult.success || !readAnswerResult.success) {
        const errors: string[] = [];
        [readQuestionResult, readAnswerResult].forEach((result) => {
          if (!result.success) {
            errors.push(`Failed to read spreadsheet data: ${result.error}`);
          }
        });
        return {
          success: false,
          processedCount: 0,
          successCount: 0,
          errorCount: 1,
          errors,
        };
      }

      const questionRows = readQuestionResult.data?.values || [];
      const answerRows = readAnswerResult.data?.values || [];

      if (questionRows.length === 0 || answerRows.length === 0) {
        return {
          success: false,
          processedCount: 0,
          successCount: 0,
          errorCount: 1,
          errors: ["No data found in the specified range"],
        };
      }

      // Generate feedbacks for each row
      const feedbacks: string[] = [];
      const errors: string[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < questionRows.length; i++) {
        const question = questionRows.at(i)?.toString().trim() || "";
        const answer = answerRows.at(i)?.toString().trim() || "";

        // Report progress if callback is provided
        if (options.onProgress) {
          // Extract row number from sourceRange (e.g., "E2:F10" -> start from row 2)
          const sourceRangeMatch =
            options.sourceRange.questionRange.match(/(\d+)/);
          const startRowFromRange = sourceRangeMatch
            ? parseInt(sourceRangeMatch[1])
            : 1;
          const currentRow = startRowFromRange + i;
          options.onProgress(i + 1, questionRows.length, currentRow);
        }

        if (!question || !answer) {
          feedbacks.push("");
          errorCount++;
          errors.push(`Row ${i + 2}: Missing question or answer`);
          continue;
        }

        const feedbackResult = await this.generateBasicFeedback({
          question,
          answer,
          customPrompt: options.customPrompt,
        });

        if (feedbackResult.success) {
          feedbacks.push(feedbackResult.feedback || "");
          successCount++;
        } else {
          feedbacks.push("");
          errorCount++;
          errors.push(`Row ${i + 2}: ${feedbackResult.error}`);
        }
      }

      // Write feedbacks to target range
      if (feedbacks.length > 0) {
        const feedbackValues = feedbacks.map((feedback) => [feedback]);

        const writeResult = await this.sheetsService.updateRange(
          options.spreadsheetId,
          options.targetRange,
          feedbackValues
        );

        if (!writeResult.success) {
          return {
            success: false,
            processedCount: questionRows.length,
            successCount,
            errorCount: errorCount + 1,
            errors: [
              ...errors,
              `Failed to write to spreadsheet: ${writeResult.error}`,
            ],
          };
        }
      }

      return {
        success: true,
        processedCount: questionRows.length,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        successCount: 0,
        errorCount: 1,
        errors: [
          `Batch feedback generation failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
      };
    }
  }

  private buildFeedbackPrompt({
    question,
    answer,
    customPrompt,
  }: BasicFeedbackRequest): string {
    let prompt = `주어진 질문과 답변에 대해 건설적인 피드백을 제공해주세요.

    질문: ${question}
    답변: ${answer}\n\n`;

    if (customPrompt) {
      prompt += `## 피드백 요구사항:\n${customPrompt}`;
    } else {
      prompt += `
      ## 피드백 요구사항:
      1. 잘한 점과 아쉬운 점을 균형있게 포함
      2. 기술적 측면과 협업 측면에서의 세부 피드백
      3. 구체적이고 실행 가능한 개선 방안 제시
      4. 응답은 한글 기준 400자 내외로 작성
      5. 마크다운 형식을 사용하지 말고 일반 텍스트로만 작성

      ## 피드백 형식:
      잘한 점:
      - 기술적 측면
      - 협업 측면
      아쉬운 점:
      - 기술적 측면
      - 협업 측면
      개선 방안:
      - 구체적인 실행 방안`;
    }

    return prompt;
  }
}
