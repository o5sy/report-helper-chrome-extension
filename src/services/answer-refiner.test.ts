import { beforeEach, describe, expect, it, vi } from "vitest";

import { AnswerRefiner } from "./answer-refiner";
import type { GeminiClient } from "./gemini-client";
import type { GoogleSheetsService } from "./google-sheets";

// Mock dependencies
const mockGeminiClient = {
  processText: vi.fn(),
} as unknown as GeminiClient;

const mockSheetsService = {
  readRange: vi.fn(),
  updateRange: vi.fn(),
} as unknown as GoogleSheetsService;

describe("AnswerRefiner", () => {
  let answerRefiner: AnswerRefiner;

  beforeEach(() => {
    vi.clearAllMocks();
    answerRefiner = new AnswerRefiner(mockGeminiClient, mockSheetsService);
  });

  describe("Extract Data from Spreadsheet", () => {
    it("should extract answer data from specified range", async () => {
      const mockSheetData = {
        success: true,
        data: {
          range: "Sheet1!A:B",
          values: [
            ["답변1", "정제된답변1"],
            ["답변2", ""],
            ["답변3", "정제된답변3"],
          ],
        },
      };

      vi.mocked(mockSheetsService.readRange).mockResolvedValue(mockSheetData);

      const result = await answerRefiner.extractAnswerData(
        "test-spreadsheet-id",
        "Sheet1!A:B"
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data?.[0]).toEqual({
        originalAnswer: "답변1",
        refinedAnswer: "정제된답변1",
        needsRefinement: false,
        rowIndex: 0,
      });
      expect(result.data?.[1].needsRefinement).toBe(true);
    });

    it("should handle spreadsheet read errors", async () => {
      vi.mocked(mockSheetsService.readRange).mockResolvedValue({
        success: false,
        error: "Permission denied",
      });

      const result = await answerRefiner.extractAnswerData(
        "test-spreadsheet-id",
        "Sheet1!A:B"
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Permission denied");
    });
  });

  describe("Refine Answer Text", () => {
    it("should refine answer using AI with default prompt", async () => {
      const originalAnswer = '답변했다 "중요한 내용" - 추가 질문이에요?';
      const expectedRefinedAnswer = "답변함 중요한 내용\n\n- 추가 질문이세요?";

      vi.mocked(mockGeminiClient.processText).mockResolvedValue({
        success: true,
        processedText: expectedRefinedAnswer,
        originalText: originalAnswer,
        processingType: "refine",
      });

      const result = await answerRefiner.refineAnswerText(originalAnswer);

      expect(result.success).toBe(true);
      expect(result.refinedText).toBe(expectedRefinedAnswer);
      expect(mockGeminiClient.processText).toHaveBeenCalledWith({
        text: originalAnswer,
        type: "refine",
        context: answerRefiner.getDefaultPromptTemplate(),
      });
    });

    it("should refine answer using custom prompt", async () => {
      const originalAnswer = "답변했다";
      const customPrompt = "~다를 ~함으로 변경해줘";
      const expectedRefinedAnswer = "답변함";

      vi.mocked(mockGeminiClient.processText).mockResolvedValue({
        success: true,
        processedText: expectedRefinedAnswer,
        originalText: originalAnswer,
        processingType: "refine",
      });

      const result = await answerRefiner.refineAnswerText(
        originalAnswer,
        customPrompt
      );

      expect(result.success).toBe(true);
      expect(result.refinedText).toBe(expectedRefinedAnswer);
      expect(mockGeminiClient.processText).toHaveBeenCalledWith({
        text: originalAnswer,
        type: "refine",
        context: customPrompt,
      });
    });

    it("should handle AI processing errors", async () => {
      vi.mocked(mockGeminiClient.processText).mockResolvedValue({
        success: false,
        processedText: "",
        originalText: "답변했다",
        processingType: "refine",
      });

      const result = await answerRefiner.refineAnswerText("답변했다");

      expect(result.success).toBe(false);
      expect(result.error).toContain("AI processing failed");
    });
  });

  describe("Write Refined Answers", () => {
    it("should write refined answers to new column", async () => {
      const refinedAnswers = [
        { rowIndex: 0, refinedAnswer: "정제된답변1" },
        { rowIndex: 2, refinedAnswer: "정제된답변3" },
      ];

      vi.mocked(mockSheetsService.updateRange).mockResolvedValue({
        success: true,
        data: {
          spreadsheetId: "test-spreadsheet-id",
          updates: {
            updatedRows: 2,
          },
        },
      });

      const result = await answerRefiner.writeRefinedAnswers(
        "test-spreadsheet-id",
        "Sheet1!C:C",
        refinedAnswers
      );

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(2);
    });

    it("should handle write errors", async () => {
      vi.mocked(mockSheetsService.updateRange).mockResolvedValue({
        success: false,
        error: "Write permission denied",
      });

      const result = await answerRefiner.writeRefinedAnswers(
        "test-spreadsheet-id",
        "Sheet1!C:C",
        [{ rowIndex: 0, refinedAnswer: "test answer" }]
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Write permission denied");
    });
  });

  describe("Process Batch Refinement", () => {
    it("should process multiple answers and write results", async () => {
      // Mock extract data
      vi.mocked(mockSheetsService.readRange).mockResolvedValue({
        success: true,
        data: {
          range: "Sheet1!A:B",
          values: [
            ["답변1", ""],
            ["답변2", ""],
          ],
        },
      });

      // Mock AI refinement
      vi.mocked(mockGeminiClient.processText)
        .mockResolvedValueOnce({
          success: true,
          processedText: "정제된답변1",
          originalText: "답변1",
          processingType: "refine",
        })
        .mockResolvedValueOnce({
          success: true,
          processedText: "정제된답변2",
          originalText: "답변2",
          processingType: "refine",
        });

      // Mock write operation
      vi.mocked(mockSheetsService.updateRange).mockResolvedValue({
        success: true,
        data: {
          spreadsheetId: "test-spreadsheet-id",
          updates: {
            updatedRows: 2,
          },
        },
      });

      const result = await answerRefiner.processBatchRefinement({
        spreadsheetId: "test-spreadsheet-id",
        sourceRange: "Sheet1!A:B",
        targetRange: "Sheet1!C:C",
      });

      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
    });

    it("should handle partial failures gracefully", async () => {
      // Mock extract data
      vi.mocked(mockSheetsService.readRange).mockResolvedValue({
        success: true,
        data: {
          range: "Sheet1!A:B",
          values: [
            ["답변1", ""],
            ["답변2", ""],
          ],
        },
      });

      // Mock AI refinement with one failure
      vi.mocked(mockGeminiClient.processText)
        .mockResolvedValueOnce({
          success: true,
          processedText: "정제된답변1",
          originalText: "답변1",
          processingType: "refine",
        })
        .mockResolvedValueOnce({
          success: false,
          processedText: "",
          originalText: "답변2",
          processingType: "refine",
        });

      // Mock write operation
      vi.mocked(mockSheetsService.updateRange).mockResolvedValue({
        success: true,
        data: {
          spreadsheetId: "test-spreadsheet-id",
          updates: {
            updatedRows: 1,
          },
        },
      });

      const result = await answerRefiner.processBatchRefinement({
        spreadsheetId: "test-spreadsheet-id",
        sourceRange: "Sheet1!A:B",
        targetRange: "Sheet1!C:C",
      });

      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(2);
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
    });
  });
});
