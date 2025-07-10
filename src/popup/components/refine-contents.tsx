import { useEffect, useState } from "react";

import { RefineAnswersMessage } from "@/types";

interface RefineContentsProps {
  geminiApiKey: string;
  spreadsheetId: string;
}

function RefineContents({ geminiApiKey, spreadsheetId }: RefineContentsProps) {
  const [sourceRange, setSourceRange] = useState<string>("D2:D3");
  const [targetRange, setTargetRange] = useState<string>("E2:E3");

  const [refinementResult, setRefinementResult] = useState<string>("");
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  // Load saved data from chrome.storage
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        if (window.chrome?.storage?.local) {
          const result = await window.chrome.storage.local.get([
            "refineContentsData",
          ]);
          if (result.refineContentsData) {
            const data = result.refineContentsData;
            setSourceRange(data.sourceRange || "D2:D3");
            setTargetRange(data.targetRange || "E2:E3");
          }
        }
      } catch (error) {
        console.error("Failed to load saved refine contents data:", error);
      }
    };

    loadSavedData();
  }, []);

  // Save data to chrome.storage whenever values change
  useEffect(() => {
    const saveData = async () => {
      try {
        if (window.chrome?.storage?.local) {
          const dataToSave = {
            sourceRange,
            targetRange,
          };
          await window.chrome.storage.local.set({
            refineContentsData: dataToSave,
          });
        }
      } catch (error) {
        console.error("Failed to save refine contents data:", error);
      }
    };

    saveData();
  }, [sourceRange, targetRange]);

  const handleRefineAnswers = async () => {
    if (!spreadsheetId.trim()) {
      setRefinementResult("스프레드시트 ID를 입력해주세요.");
      setProcessingTime(null);
      return;
    }

    if (!geminiApiKey.trim()) {
      setRefinementResult("Gemini API 키를 먼저 설정해주세요.");
      setProcessingTime(null);
      return;
    }

    const startTime = Date.now();

    try {
      setRefinementResult("답변 정제 작업을 시작합니다...");
      setProcessingTime(null);

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
      const endTime = Date.now();
      const duration = endTime - startTime;
      setProcessingTime(duration);

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
      const endTime = Date.now();
      const duration = endTime - startTime;
      setProcessingTime(duration);

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
      <h2 className="text-lg font-semibold mb-3">답변 정제 자동화</h2>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">원본 범위</label>
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
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium mb-2">정제 결과:</p>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto min-h-[50px] whitespace-pre-wrap">
          {refinementResult || "아직 실행하지 않음"}
        </pre>
        {processingTime && (
          <div className="mt-2 text-xs text-gray-600">
            소요시간: {(processingTime / 1000).toFixed(2)}초
          </div>
        )}
      </div>

      <button
        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mt-3"
        type="button"
        onClick={handleRefineAnswers}
        disabled={!geminiApiKey.trim() || !spreadsheetId.trim()}
      >
        답변 정제 실행
      </button>
    </>
  );
}

export default RefineContents;
