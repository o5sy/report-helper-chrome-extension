import type {
  AnswerData,
  BatchRefinementOptions,
  BatchRefinementResult,
  RefinementResult,
  WriteResult,
} from "../types";

import type { GeminiClient } from "./gemini-client";
import type { GoogleSheetsService } from "./google-sheets";

export class AnswerRefiner {
  private readonly DEFAULT_PROMPT = `표현과 문장은 거의 수정하지 말고 띄어쓰기나 오타 등 아주 어색한 표현만 교정해줘
그리고 했다는 ~함 형태로 수정해줘
큰따옴표는 빼줘
답변 중 '- '가 붙은 형태의 질문은 내가 꼬리질문한 내용이니 이전 답변 내용에서 줄바꿈으로 한줄 공백을 두고 존댓말로 수정해줘 대신 질문 앞머리에 '- '를 유지해서 '- 질문' 형태로 수정해줘`;

  constructor(
    private geminiClient: GeminiClient,
    private sheetsService: GoogleSheetsService
  ) {}

  getDefaultPromptTemplate(): string {
    return this.DEFAULT_PROMPT;
  }

  async extractAnswerData(
    spreadsheetId: string,
    range: string
  ): Promise<{ success: boolean; data?: AnswerData[]; error?: string }> {
    try {
      const result = await this.sheetsService.readRange(spreadsheetId, range);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      if (!result.data?.values) {
        return {
          success: true,
          data: [],
        };
      }

      const answerData: AnswerData[] = result.data.values.map((row, index) => {
        const originalAnswer = row[0] || "";
        const refinedAnswer = row[1] || "";

        return {
          originalAnswer,
          refinedAnswer,
          needsRefinement: !refinedAnswer.trim(),
          rowIndex: index,
        };
      });

      return {
        success: true,
        data: answerData,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to extract data: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async refineAnswerText(
    text: string,
    customPrompt?: string
  ): Promise<RefinementResult> {
    try {
      const prompt = customPrompt || this.DEFAULT_PROMPT;

      const result = await this.geminiClient.processText({
        text,
        type: "refine",
        context: prompt,
      });

      if (!result.success) {
        return {
          success: false,
          error: "AI processing failed",
        };
      }

      return {
        success: true,
        refinedText: result.processedText,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to refine text: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async writeRefinedAnswers(
    spreadsheetId: string,
    range: string,
    answers: Array<{ rowIndex: number; refinedAnswer: string }>
  ): Promise<WriteResult> {
    try {
      if (answers.length === 0) {
        return {
          success: true,
          updatedCount: 0,
        };
      }

      // Create values array for batch update
      const values: string[][] = [];

      // Fill values array with refined answers at correct positions
      const maxRowIndex = Math.max(...answers.map((a) => a.rowIndex));
      for (let i = 0; i <= maxRowIndex; i++) {
        const answer = answers.find((a) => a.rowIndex === i);
        values.push([answer?.refinedAnswer || ""]);
      }

      const result = await this.sheetsService.updateRange(
        spreadsheetId,
        range,
        values
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        updatedCount: answers.length,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to write refined answers: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async processBatchRefinement(
    options: BatchRefinementOptions
  ): Promise<BatchRefinementResult> {
    try {
      // Extract data from spreadsheet
      const extractResult = await this.extractAnswerData(
        options.spreadsheetId,
        options.sourceRange
      );

      if (!extractResult.success) {
        return {
          success: false,
          processedCount: 0,
          successCount: 0,
          errorCount: 0,
          errors: [extractResult.error || "Failed to extract data"],
        };
      }

      if (!extractResult.data || extractResult.data.length === 0) {
        return {
          success: true,
          processedCount: 0,
          successCount: 0,
          errorCount: 0,
        };
      }

      // Filter items that need refinement
      const itemsToRefine = extractResult.data.filter(
        (item) => item.needsRefinement
      );

      if (itemsToRefine.length === 0) {
        return {
          success: true,
          processedCount: 0,
          successCount: 0,
          errorCount: 0,
        };
      }

      // Refine answers
      const refinedAnswers: Array<{ rowIndex: number; refinedAnswer: string }> =
        [];
      const errors: string[] = [];

      for (const item of itemsToRefine) {
        const refineResult = await this.refineAnswerText(
          item.originalAnswer,
          options.customPrompt
        );

        if (refineResult.success && refineResult.refinedText) {
          refinedAnswers.push({
            rowIndex: item.rowIndex,
            refinedAnswer: refineResult.refinedText,
          });
        } else {
          errors.push(
            `Row ${item.rowIndex}: ${refineResult.error || "Unknown error"}`
          );
        }
      }

      // Write refined answers
      if (refinedAnswers.length > 0) {
        const writeResult = await this.writeRefinedAnswers(
          options.spreadsheetId,
          options.targetRange,
          refinedAnswers
        );

        if (!writeResult.success) {
          errors.push(`Write failed: ${writeResult.error}`);
        }
      }

      return {
        success: true,
        processedCount: itemsToRefine.length,
        successCount: refinedAnswers.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        processedCount: 0,
        successCount: 0,
        errorCount: 1,
        errors: [
          `Unexpected error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
      };
    }
  }
}
