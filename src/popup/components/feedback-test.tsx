import type { BasicFeedbackRequest, FeedbackResult } from "../../types";
import React, { useState } from "react";

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

  const handleClear = () => {
    setResult(null);
    setQuestion("JavaScript의 장점은 무엇인가요?");
    setAnswer("JavaScript는 웹 개발에서 널리 사용되는 언어입니다.");
    setContext("");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">피드백 생성 테스트</h3>

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
                  <p>개인화 여부: {result.isPersonalized ? "예" : "아니오"}</p>
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
  );
};

export default FeedbackTest;
