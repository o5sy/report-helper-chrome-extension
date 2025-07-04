import type {
  BasicFeedbackRequest,
  BatchFeedbackResult,
  FeedbackResult,
} from "../../types";
import React, { useEffect, useState } from "react";

import { FeedbackGenerator } from "../../services";

interface FeedbackTestProps {
  geminiApiKey: string;
}

const FeedbackTest: React.FC<FeedbackTestProps> = ({ geminiApiKey }) => {
  const [question, setQuestion] = useState<string>(
    "JavaScript의 장점은 무엇인가요?"
  );
  const [answer, setAnswer] = useState<string>(
    "JavaScript는 웹 개발에서 널리 사용되는 언어입니다."
  );
  const [context, setContext] = useState<string>("");
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sheet integration fields
  const [spreadsheetId, setSpreadsheetId] = useState<string>("");
  const [questionColumn, setQuestionColumn] = useState<string>("");
  const [answerColumn, setAnswerColumn] = useState<string>("");
  const [targetColumn, setTargetColumn] = useState<string>("");
  const [startRow, setStartRow] = useState<number>(2);
  const [endRow, setEndRow] = useState<number>(10);
  const [batchResult, setBatchResult] = useState<BatchFeedbackResult | null>(
    null
  );
  const [isBatchLoading, setIsBatchLoading] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    currentRow: number;
  } | null>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("feedbackTestData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setQuestion(data.question || "JavaScript의 장점은 무엇인가요?");
        setAnswer(
          data.answer || "JavaScript는 웹 개발에서 널리 사용되는 언어입니다."
        );
        setContext(data.context || "");
        setLanguage(data.language || "ko");
        setSpreadsheetId(data.spreadsheetId || "");
        setQuestionColumn(data.questionColumn || "");
        setAnswerColumn(data.answerColumn || "");
        setTargetColumn(data.targetColumn || "");
        setStartRow(data.startRow || 2);
        setEndRow(data.endRow || 10);
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever values change
  useEffect(() => {
    const dataToSave = {
      question,
      answer,
      context,
      language,
      spreadsheetId,
      questionColumn,
      answerColumn,
      targetColumn,
      startRow,
      endRow,
    };
    localStorage.setItem("feedbackTestData", JSON.stringify(dataToSave));
  }, [
    question,
    answer,
    context,
    language,
    spreadsheetId,
    questionColumn,
    answerColumn,
    targetColumn,
    startRow,
    endRow,
  ]);

  const handleGenerateFeedback = async () => {
    if (!geminiApiKey) {
      alert("Gemini API Key가 필요합니다.");
      return;
    }

    if (!question.trim() || !answer.trim()) {
      alert("질문과 답변을 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const feedbackGenerator = new FeedbackGenerator({
        apiKey: geminiApiKey,
        model: "gemini-2.0-flash",
        maxOutputTokens: 1000,
        temperature: 0.7,
      });

      const request: BasicFeedbackRequest = {
        question: question.trim(),
        answer: answer.trim(),
        language,
        context: context.trim() || undefined,
      };

      const feedbackResult = await feedbackGenerator.generateBasicFeedback(
        request
      );
      setResult(feedbackResult);
    } catch (error) {
      setResult({
        success: false,
        error: `피드백 생성 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchFeedback = async () => {
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
    setBatchProgress({
      current: 0,
      total: endRow - startRow + 1,
      currentRow: startRow,
    });

    try {
      // Create source range for specific rows
      const sourceRange = `${questionColumn}${startRow}:${answerColumn}${endRow}`;
      const targetRange = `${targetColumn}${startRow}:${targetColumn}${endRow}`;

      // Send message to background script for processing
      const response = await globalThis.chrome?.runtime?.sendMessage({
        type: "GENERATE_FEEDBACK",
        payload: {
          spreadsheetId: spreadsheetId.trim(),
          sourceRange: sourceRange,
          targetRange: targetRange,
          apiKey: geminiApiKey,
        },
      });

      if (response.success) {
        setBatchResult(response.data);
        // Show success notification
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

  const handleClear = () => {
    setResult(null);
    setBatchResult(null);
    setQuestion("JavaScript의 장점은 무엇인가요?");
    setAnswer("JavaScript는 웹 개발에서 널리 사용되는 언어입니다.");
    setContext("");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">피드백 생성 테스트</h3>

      {/* Batch Feedback Generation - 먼저 렌더링 */}
      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="font-medium">배치 피드백 생성 (시트 연동)</h4>

        {/* Spreadsheet ID */}
        <div>
          <label className="block text-sm font-medium mb-1">
            스프레드시트 ID
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="1A2B3C4D5E6F7G8H9I0J..."
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
          />
        </div>

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
              placeholder="2"
              value={startRow}
              onChange={(e) => setStartRow(parseInt(e.target.value) || 2)}
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">종료 행</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="10"
              value={endRow}
              onChange={(e) => setEndRow(parseInt(e.target.value) || 10)}
              min="1"
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

      {/* Single Feedback Test */}
      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="font-medium">단일 피드백 생성</h4>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">언어:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "ko" | "en")}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Question Input */}
        <div>
          <label className="block text-sm font-medium mb-1">질문:</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            rows={2}
            placeholder="질문을 입력하세요"
          />
        </div>

        {/* Answer Input */}
        <div>
          <label className="block text-sm font-medium mb-1">답변:</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="답변을 입력하세요"
          />
        </div>

        {/* Context Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            컨텍스트 (선택사항):
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            rows={2}
            placeholder="추가 컨텍스트를 입력하세요"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleGenerateFeedback}
            disabled={isLoading || !geminiApiKey}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? "생성 중..." : "피드백 생성"}
          </button>
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:bg-gray-400"
          >
            초기화
          </button>
        </div>

        {/* Result Display */}
        {result && (
          <div className="mt-4 p-3 border rounded">
            <h4 className="font-medium mb-2">결과:</h4>
            {result.success ? (
              <div className="space-y-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <h5 className="font-medium text-green-800 mb-1">
                    생성된 피드백:
                  </h5>
                  <p className="text-sm text-green-700 whitespace-pre-wrap">
                    {result.feedback}
                  </p>
                </div>
                {result.metadata && (
                  <div className="text-xs text-gray-600">
                    <p>토큰 사용량: {result.metadata.tokensUsed}</p>
                    <p>처리 시간: {result.metadata.processingTime}ms</p>
                    <p>
                      개인화 여부: {result.isPersonalized ? "예" : "아니오"}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <h5 className="font-medium text-red-800 mb-1">오류:</h5>
                <p className="text-sm text-red-700">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackTest;
