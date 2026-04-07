import { GeminiClient } from "@/services/gemini-client";
import { GoogleSheetsService } from "@/services/google-sheets";
import { QuestionReference, ReferenceData, SyncResult } from "./types";

const STORAGE_KEY = "referenceData";
// TODO 시트 구조 유연화 필요
const QUESTION_COL = 1; // B열: 질문
const FEEDBACK_COL = 3; // D열: 피드백
const MAX_EXAMPLES_PER_QUESTION = 3;
const TONE_SAMPLE_COUNT = 15;
const SHEET_RANGE = "A:E"; // 카테고리/질문/멘티답변메모/피드백/점수

// --- Pure functions (testable) ---

export function parseSheetIds(urlsText: string): string[] {
  const tokens = urlsText.split(/[\n,\s]+/).filter(Boolean);
  const sheetIds = new Set<string>();

  for (const token of tokens) {
    const match = token.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      sheetIds.add(match[1]);
    } else if (/^[a-zA-Z0-9-_]{20,}$/.test(token)) {
      sheetIds.add(token);
    }
  }

  return [...sheetIds];
}

/**
 * @param dataRows - 헤더 제외한 데이터 행
 */
export function extractReferenceQuestions(
  dataRows: string[][],
  maxExamples = MAX_EXAMPLES_PER_QUESTION,
): Record<string, QuestionReference> {
  const questionMap: Record<string, string[]> = {};

  // 아래에서 위로 (최신 행 = 높은 인덱스)
  for (let i = dataRows.length - 1; i >= 0; i--) {
    const row = dataRows[i];
    const question = row[QUESTION_COL]?.toString().trim();
    const feedback = row[FEEDBACK_COL]?.toString().trim();

    if (!question || !feedback) continue;

    if (!questionMap[question]) questionMap[question] = [];
    if (questionMap[question].length < maxExamples) {
      questionMap[question].push(feedback);
    }
  }

  return Object.fromEntries(
    Object.entries(questionMap).map(([q, examples]) => [q, { examples }]),
  );
}

/**
 * 말투/톤 분석용 피드백 샘플 추출 (질문별 중복 없이 다양하게)
 * @param dataRows - 헤더 제외한 데이터 행
 */
export function sampleToneFeedbacks(
  dataRows: string[][],
  sampleCount = TONE_SAMPLE_COUNT,
): string[] {
  const samples: string[] = [];
  const seenQuestions = new Set<string>();

  for (let i = dataRows.length - 1; i >= 0; i--) {
    const row = dataRows[i];
    const question = row[QUESTION_COL]?.toString().trim();
    const feedback = row[FEEDBACK_COL]?.toString().trim();

    if (!question || !feedback) continue;
    if (seenQuestions.has(question)) continue;

    seenQuestions.add(question);
    samples.push(feedback);

    if (samples.length >= sampleCount) break;
  }

  return samples;
}

// --- ReferenceStoreService ---

export class ReferenceStoreService {
  async getData(): Promise<ReferenceData | null> {
    try {
      const result = await globalThis.chrome?.storage?.local?.get([STORAGE_KEY]);
      return (result?.[STORAGE_KEY] as ReferenceData) ?? null;
    } catch {
      return null;
    }
  }

  async getExamplesForQuestion(question: string): Promise<string[] | null> {
    const data = await this.getData();
    if (!data) return null;

    const entry = data.questions[question.trim()];
    return entry?.examples?.length ? entry.examples : null;
  }

  async getToneSystemPrompt(): Promise<string | null> {
    const data = await this.getData();
    return data?.toneSystemPrompt || null;
  }

  async saveToneSystemPrompt(prompt: string): Promise<void> {
    const data = await this.getData();
    if (!data) return;


    // TODO chrome storage 접근 서비스 분리 및 재사용
    await globalThis.chrome?.storage?.local?.set({
      [STORAGE_KEY]: { ...data, toneSystemPrompt: prompt },
    });
  }

  async syncFromUrls(
    urlsText: string,
    sheetsService: GoogleSheetsService,
    geminiClient: GeminiClient,
  ): Promise<SyncResult> {
    const sheetIds = parseSheetIds(urlsText);

    if (sheetIds.length === 0) {
      return { success: false, error: "유효한 시트 URL 또는 ID를 찾을 수 없습니다." };
    }

    const allDataRows: string[][] = [];
    const errors: string[] = [];

    for (const sheetId of sheetIds) {
      const result = await sheetsService.readRange(sheetId, SHEET_RANGE);
      if (!result.success) {
        errors.push(`시트 ${sheetId}: ${result.error}`);
        continue;
      }
      const rows = (result.data?.values as string[][]) ?? [];
      allDataRows.push(...rows.slice(1)); // 헤더 제외
    }

    if (allDataRows.length === 0) {
      return {
        success: false,
        error: errors.length > 0 ? errors.join("; ") : "데이터가 없습니다.",
      };
    }

    const questions = extractReferenceQuestions(allDataRows);
    const toneSamples = sampleToneFeedbacks(allDataRows);
    const toneSystemPrompt = await this.generateToneSystemPrompt(toneSamples, geminiClient);

    const referenceData: ReferenceData = {
      lastSynced: new Date().toISOString(),
      sourceSheetIds: sheetIds,
      questions,
      toneSystemPrompt,
    };

    await globalThis.chrome?.storage?.local?.set({ [STORAGE_KEY]: referenceData });

    return {
      success: true,
      questionCount: Object.keys(questions).length,
      toneSystemPrompt,
    };
  }

  private async generateToneSystemPrompt(
    feedbackSamples: string[],
    geminiClient: GeminiClient,
  ): Promise<string> {
    if (feedbackSamples.length === 0) return "";

    const samplesText = feedbackSamples
      .map((f, i) => `예시 ${i + 1}:\n${f}`)
      .join("\n\n");

    const prompt = `다음은 기술 면접 멘토링에서 실제로 작성된 피드백 예시들입니다:\n\n${samplesText}\n\n이 피드백들의 말투, 톤, 어조, 문체 패턴을 분석해서, 동일한 스타일로 피드백을 작성하도록 안내하는 시스템 프롬프트를 한국어로 작성해주세요. 구체적인 표현 패턴과 어조 특징을 포함해주세요.`;

    const response = await geminiClient.processText({
      type: "feedback",
      prompt,
    });

    return response.success ? response.processedText : "";
  }
}