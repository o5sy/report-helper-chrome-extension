import { RefineAnswersMessage } from "@/types";
import { useState } from "react";

interface RefineContentsProps {
  geminiApiKey: string;
}

function RefineContents({ geminiApiKey }: RefineContentsProps) {
  // TODO background script에서 스프레드시트 ID 가져오기

  const [spreadsheetId, setSpreadsheetId] = useState<string>("");
  const [sourceRange, setSourceRange] = useState<string>("A:B");
  const [targetRange, setTargetRange] = useState<string>("D:D");
  //   const [customPrompt, setCustomPrompt] = useState<string>("");

  const [refinementResult, setRefinementResult] = useState<string>("");

  const handleRefineAnswers = async () => {
    if (!spreadsheetId.trim()) {
      setRefinementResult("스프레드시트 ID를 입력해주세요.");
      return;
    }

    if (!geminiApiKey.trim()) {
      setRefinementResult("Gemini API 키를 먼저 설정해주세요.");
      return;
    }

    try {
      setRefinementResult("답변 정제 작업을 시작합니다...");

      // Store API key in sync storage for background script
      await window.chrome.storage.sync.set({ geminiApiKey });

      const message: RefineAnswersMessage = {
        type: "REFINE_ANSWERS",
        payload: {
          spreadsheetId: spreadsheetId.trim(),
          sourceRange: sourceRange.trim() || "A:B",
          targetRange: targetRange.trim() || "C:C",
          //   customPrompt: customPrompt.trim() || undefined,
        },
      };

      const response = await window.chrome.runtime.sendMessage(message);

      if (response.success) {
        const result = response.data;
        setRefinementResult(
          `✅ 답변 정제 완료!\n` +
            `처리된 항목: ${result.processedCount}개\n` +
            `성공: ${result.successCount}개\n` +
            `실패: ${result.errorCount}개\n` +
            (result.errors ? `\n오류:\n${result.errors.join("\n")}` : "")
        );
      } else {
        setRefinementResult(`❌ 답변 정제 실패: ${response.error}`);
      }
    } catch (error) {
      setRefinementResult(
        `❌ 예외 발생: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <>
      {/* Answer Refinement Section */}
      <div className="border-t pt-4">
        <h2 className="text-lg font-semibold mb-3">답변 정제 자동화</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              스프레드시트 ID
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Google Sheets 스프레드시트 ID"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                원본 범위
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="A:B"
                value={sourceRange}
                onChange={(e) => setSourceRange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                정제된 답변 열
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="C:C"
                value={targetRange}
                onChange={(e) => setTargetRange(e.target.value)}
              />
            </div>
          </div>

          {/* <div>
            <label className="block text-sm font-medium mb-1">
              커스텀 프롬프트 (선택사항)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="기본 프롬프트 대신 사용할 커스텀 프롬프트를 입력하세요"
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div> */}
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-2">정제 결과:</p>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto min-h-[50px] whitespace-pre-wrap">
            {refinementResult || "아직 실행하지 않음"}
          </pre>
        </div>

        <button
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mt-3"
          type="button"
          onClick={handleRefineAnswers}
          disabled={!geminiApiKey.trim() || !spreadsheetId.trim()}
        >
          답변 정제 실행
        </button>
      </div>
    </>
  );
}

export default RefineContents;
