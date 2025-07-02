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
  private readonly DEFAULT_PROMPT = `주어진 텍스트는 학생의 모의 면접 답변을 멘토가 타이핑한 메모입니다. 다음 지침에 따라 텍스트를 수정해 주세요. 그리고 답변은 수정한 텍스트 외의 다른 내용은 절대 포함하지 마세요. : 

1. **표현 및 문장 유지**: 학생의 원래 표현과 문장 구조는 최대한 유지해 주세요. 내용의 의미가 바뀌지 않는 선에서 띄어쓰기, 오타, 아주 어색한 비문만 교정해 주세요. 
2. **어미 변경**: 모든 '했다', '했습니다' 등의 과거형 서술어를 '~함' 형태로 변경해 주세요. (예: "발표를 했다" → "발표를 함") 
3. **큰따옴표 제거**: 텍스트 내의 모든 큰따옴표("")를 제거해 주세요.
4. **꼬리 질문 처리**:
    * '- '로 시작하는 문장은 멘토의 꼬리 질문입니다.
    * 위 형식의 꼬리 질문이 있다면 아래 지침대로 수정하고, 없다면 관련 작업은 하지 않습니다.
    * 꼬리 질문은 바로 이전 학생의 답변 내용과 명확히 구분될 수 있도록 **한 줄 공백(줄바꿈)**을 추가한 후에 배치해 주세요.
    * 꼬리 질문의 내용은 학생에게 던지는 질문이므로 **존댓말**로 수정해 주세요.
    * 꼬리 질문의 시작 부분인 '- '는 그대로 유지하여 '- 질문 내용' 형태로 만들어 주세요.

이 지침을 철저히 따라 텍스트를 수정해 주시기 바랍니다.`;

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
