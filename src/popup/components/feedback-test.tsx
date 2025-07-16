import React, { useEffect, useState } from "react";

import type { BatchFeedbackResult } from "@/services/feedback-generator";

interface FeedbackTestProps {
  geminiApiKey: string;
  spreadsheetId: string;
}

const FeedbackTest: React.FC<FeedbackTestProps> = ({
  geminiApiKey,
  spreadsheetId,
}) => {
  const [questionColumn, setQuestionColumn] = useState<string>("");
  const [answerColumn, setAnswerColumn] = useState<string>("");
  const [targetColumn, setTargetColumn] = useState<string>("");
  const [startRow, setStartRow] = useState<number>(2);
  const [endRow, setEndRow] = useState<number>(10);
  const [batchResult, setBatchResult] = useState<BatchFeedbackResult | null>(
    null
  );
  const [isBatchLoading, setIsBatchLoading] = useState<boolean>(false);
  const [batchProcessingTime, setBatchProcessingTime] = useState<number | null>(
    null
  );
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    currentRow: number;
  } | null>(null);

  // Load saved data from chrome.storage
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        if (window.chrome?.storage?.local) {
          const result = await window.chrome.storage.local.get([
            "feedbackTestData",
          ]);
          if (result.feedbackTestData) {
            const data = result.feedbackTestData;
            setQuestionColumn(data.questionColumn || "");
            setAnswerColumn(data.answerColumn || "");
            setTargetColumn(data.targetColumn || "");
            setStartRow(data.startRow || 2);
            setEndRow(data.endRow || 10);
          }
        }
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    };

    loadSavedData();
  }, []);

  // TODO storage에 직접 접근 못하도록 수정
  // Save data to chrome.storage whenever values change
  useEffect(() => {
    const saveData = async () => {
      try {
        if (window.chrome?.storage?.local) {
          const dataToSave = {
            questionColumn,
            answerColumn,
            targetColumn,
            startRow,
            endRow,
          };
          await window.chrome.storage.local.set({
            feedbackTestData: dataToSave,
          });
        }
      } catch (error) {
        console.error("Failed to save feedback test data:", error);
      }
    };

    saveData();
  }, [questionColumn, answerColumn, targetColumn, startRow, endRow]);

  const handleBatchFeedback = async () => {
    // TODO 알림도 다른 ui(refinementResult)와 동일하게 처리
    if (!geminiApiKey) {
      alert("Gemini API Key가 필요합니다.");
      return;
    }

    if (
      !spreadsheetId.trim() ||
      !questionColumn.trim() ||
      !answerColumn.trim() ||
      !targetColumn.trim()
    ) {
      alert(
        "스프레드시트 ID, 질문 열, 답변 열, 피드백 열을 모두 입력해주세요."
      );
      return;
    }

    if (startRow < 1 || endRow < startRow) {
      alert("올바른 행 범위를 입력해주세요.");
      return;
    }

    setIsBatchLoading(true);
    setBatchResult(null);
    setBatchProcessingTime(null);
    const startTime = Date.now();
    setBatchProgress({
      current: 0,
      total: endRow - startRow + 1,
      currentRow: startRow,
    });

    try {
      const questionRange = `${questionColumn}${startRow}:${questionColumn}${endRow}`;
      const answerRange = `${answerColumn}${startRow}:${answerColumn}${endRow}`;
      const targetRange = `${targetColumn}${startRow}:${targetColumn}${endRow}`;

      const response = await globalThis.chrome?.runtime?.sendMessage({
        type: "GENERATE_FEEDBACK",
        payload: {
          spreadsheetId: spreadsheetId.trim(),
          sourceRange: {
            questionRange,
            answerRange,
          },
          targetRange: targetRange,
        },
      });

      const endTime = Date.now();
      setBatchProcessingTime(endTime - startTime);

      if (response.success) {
        setBatchResult(response.data);
        alert(
          "배치 피드백 생성이 완료되었습니다. 팝업을 닫아도 처리가 계속됩니다."
        );
      } else {
        setBatchResult({
          success: false,
          processedCount: 0,
          successCount: 0,
          errorCount: 1,
          errors: [
            response.error || "배치 피드백 생성 중 오류가 발생했습니다.",
          ],
        });
      }
    } catch (error) {
      const endTime = Date.now();
      setBatchProcessingTime(endTime - startTime);
      setBatchResult({
        success: false,
        processedCount: 0,
        successCount: 0,
        errorCount: 1,
        errors: [
          `배치 피드백 생성 중 오류가 발생했습니다: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
      });
    } finally {
      setIsBatchLoading(false);
      setBatchProgress(null);
    }
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-3">피드백 생성</h2>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">질문 열</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="E"
              value={questionColumn}
              onChange={(e) => setQuestionColumn(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">답변 열</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="F"
              value={answerColumn}
              onChange={(e) => setAnswerColumn(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              피드백 출력 열
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="I"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">시작 행</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={startRow}
              onChange={(e) => setStartRow(parseInt(e.target.value))}
              onBlur={(e) => e.target.value === "" && setStartRow(0)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">종료 행</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={endRow}
              onChange={(e) => setEndRow(parseInt(e.target.value))}
              onBlur={(e) => e.target.value === "" && setEndRow(0)}
            />
          </div>
        </div>

        <button
          onClick={handleBatchFeedback}
          disabled={isBatchLoading || !geminiApiKey}
          className="w-full px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
        >
          {isBatchLoading ? "배치 피드백 생성 중..." : "배치 피드백 생성"}
        </button>

        {/* Progress Display */}
        {batchProgress && (
          <div className="mt-4 p-3 border rounded bg-blue-50">
            <h4 className="font-medium mb-2">진행 상태:</h4>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (batchProgress.current / batchProgress.total) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="text-sm text-blue-700">
                <p>
                  진행률: {batchProgress.current}/{batchProgress.total} (
                  {Math.round(
                    (batchProgress.current / batchProgress.total) * 100
                  )}
                  %)
                </p>
                <p>현재 처리 중인 행: {batchProgress.currentRow}</p>
              </div>
            </div>
          </div>
        )}

        {/* Batch Result Display */}
        {batchResult && (
          <div className="mt-4 p-3 border rounded">
            <h4 className="font-medium mb-2">배치 처리 결과:</h4>
            {batchProcessingTime && (
              <div className="mb-2 text-xs text-gray-600">
                소요시간: {(batchProcessingTime / 1000).toFixed(2)}초
              </div>
            )}
            {batchResult.success ? (
              <div className="space-y-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <h5 className="font-medium text-green-800 mb-1">
                    처리 완료:
                  </h5>
                  <div className="text-sm text-green-700">
                    <p>전체 처리: {batchResult.processedCount}개</p>
                    <p>성공: {batchResult.successCount}개</p>
                    <p>실패: {batchResult.errorCount}개</p>
                  </div>
                </div>
                {batchResult.errors && batchResult.errors.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h5 className="font-medium text-yellow-800 mb-1">
                      오류 목록:
                    </h5>
                    <ul className="text-sm text-yellow-700 list-disc list-inside">
                      {batchResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <h5 className="font-medium text-red-800 mb-1">오류:</h5>
                <div className="text-sm text-red-700">
                  {batchResult.errors && batchResult.errors.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {batchResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>알 수 없는 오류가 발생했습니다.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default FeedbackTest;
