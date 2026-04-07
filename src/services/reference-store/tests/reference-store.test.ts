import { describe, expect, it } from "vitest";

import {
  extractReferenceQuestions,
  parseSheetIds,
  sampleToneFeedbacks,
} from "../reference-store";

describe("parseSheetIds", () => {
  it("Google Sheets URL에서 ID 추출", () => {
    const url =
      "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit";
    expect(parseSheetIds(url)).toEqual(["1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"]);
  });

  it("여러 URL 줄바꿈 구분 처리", () => {
    const urls = [
      "https://docs.google.com/spreadsheets/d/sheetId1/edit",
      "https://docs.google.com/spreadsheets/d/sheetId2/edit",
    ].join("\n");
    expect(parseSheetIds(urls)).toEqual(["sheetId1", "sheetId2"]);
  });

  it("raw sheet ID 직접 입력 처리", () => {
    const rawId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms";
    expect(parseSheetIds(rawId)).toEqual([rawId]);
  });

  it("중복 URL 제거", () => {
    const urls = [
      "https://docs.google.com/spreadsheets/d/sameId/edit",
      "https://docs.google.com/spreadsheets/d/sameId/edit#gid=0",
    ].join("\n");
    expect(parseSheetIds(urls)).toEqual(["sameId"]);
  });

  it("유효하지 않은 입력은 빈 배열 반환", () => {
    expect(parseSheetIds("not a url")).toEqual([]);
    expect(parseSheetIds("")).toEqual([]);
  });
});

describe("extractReferenceQuestions", () => {
  const makeRow = (question: string, feedback: string): string[] =>
    ["카테고리", question, "답변메모", feedback, "점수"];

  it("질문별 피드백 추출", () => {
    const rows = [makeRow("질문A", "피드백1"), makeRow("질문B", "피드백2")];
    const result = extractReferenceQuestions(rows);
    expect(result["질문A"].examples).toEqual(["피드백1"]);
    expect(result["질문B"].examples).toEqual(["피드백2"]);
  });

  it("동일 질문 최대 N개 유지 (최신 우선)", () => {
    const rows = [
      makeRow("질문A", "오래된 피드백1"),
      makeRow("질문A", "오래된 피드백2"),
      makeRow("질문A", "최신 피드백3"),
      makeRow("질문A", "최신 피드백4"),
    ];
    const result = extractReferenceQuestions(rows, 3);
    expect(result["질문A"].examples).toHaveLength(3);
    // 아래에서 위로 처리하므로 최신 행(인덱스 높은 것) 먼저
    expect(result["질문A"].examples[0]).toBe("최신 피드백4");
    expect(result["질문A"].examples[1]).toBe("최신 피드백3");
    expect(result["질문A"].examples[2]).toBe("오래된 피드백2");
  });

  it("질문 또는 피드백 비어있는 행 무시", () => {
    const rows = [
      ["카테고리", "", "메모", "피드백", "점수"],
      ["카테고리", "질문A", "메모", "", "점수"],
      makeRow("질문B", "피드백B"),
    ];
    const result = extractReferenceQuestions(rows);
    expect(Object.keys(result)).toEqual(["질문B"]);
  });

  it("앞뒤 공백 trim 처리", () => {
    const rows = [makeRow("  질문A  ", "  피드백1  ")];
    const result = extractReferenceQuestions(rows);
    expect(result["질문A"].examples[0]).toBe("피드백1");
  });
});

describe("sampleToneFeedbacks", () => {
  const makeRow = (question: string, feedback: string): string[] =>
    ["카테고리", question, "답변메모", feedback, "점수"];

  it("질문별 중복 없이 샘플 추출", () => {
    const rows = [
      makeRow("질문A", "피드백A1"),
      makeRow("질문A", "피드백A2"),
      makeRow("질문B", "피드백B1"),
    ];
    const samples = sampleToneFeedbacks(rows);
    expect(samples).toHaveLength(2);
  });

  it("sampleCount 제한 준수", () => {
    const rows = Array.from({ length: 20 }, (_, i) =>
      makeRow(`질문${i}`, `피드백${i}`),
    );
    const samples = sampleToneFeedbacks(rows, 5);
    expect(samples).toHaveLength(5);
  });

  it("최신 행 우선 샘플링", () => {
    const rows = [
      makeRow("질문A", "오래된 피드백"),
      makeRow("질문B", "최신 피드백"),
    ];
    const samples = sampleToneFeedbacks(rows, 1);
    expect(samples[0]).toBe("최신 피드백");
  });
});
