import { GeminiConfig, TextProcessingRequest } from "@/types";
import { useEffect, useState } from "react";

import { GeminiClient } from "@/services/gemini-client";
import { GoogleAuthService } from "@/services/google-auth";
import { GoogleSheetsService } from "@/services/google-sheets";

interface TestContentsProps {
  geminiApiKey: string;
}

function TestContents({ geminiApiKey }: TestContentsProps) {
  const [chromeInfo, setChromeInfo] = useState<string>("확인 중...");
  const [apiTestResult, setApiTestResult] = useState<string>("");
  const [geminiTestResult, setGeminiTestResult] = useState<string>("");

  const handleTestGoogleAPI = async () => {
    try {
      setApiTestResult("테스트 시작...");

      // 1. 인증 서비스 초기화
      const authService = new GoogleAuthService();

      // 2. 시트 서비스 초기화
      const sheetsService = new GoogleSheetsService(authService);

      // 3. 테스트용 스프레드시트 메타데이터 조회
      const testSpreadsheetId = "1-VI7YF8-gZ44ASrcFknIt_lBLBOwgASGAq9rMAYFcPw"; // 테스트용 스프레드시트 ID
      const result = await sheetsService.getSpreadsheetMetadata(
        testSpreadsheetId
      );

      if (result.success) {
        setApiTestResult(JSON.stringify(result.data, null, 2));
      } else {
        setApiTestResult(`오류 발생: ${result.error}`);
      }
    } catch (error) {
      setApiTestResult(
        `예외 발생: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  const handleTestGeminiAPI = async () => {
    if (!geminiApiKey.trim()) {
      setGeminiTestResult("API 키를 입력해주세요.");
      return;
    }

    try {
      setGeminiTestResult("Gemini API 테스트 시작...");

      const config: GeminiConfig = {
        apiKey: geminiApiKey,
        model: "gemini-1.5-flash",
        maxOutputTokens: 100,
        temperature: 0.7,
      };

      const client = new GeminiClient(config);

      const testRequest: TextProcessingRequest = {
        text: "안녕하세요. 이것은 Gemini API 연동 테스트입니다.",
        type: "refine",
      };

      const result = await client.processText(testRequest);

      if (result.success) {
        const testResult = {
          success: true,
          processedText: result.processedText,
          tokensUsed: result.metadata?.tokensUsed || 0,
          processingTime: result.metadata?.processingTime || 0,
        };
        setGeminiTestResult(JSON.stringify(testResult, null, 2));
      } else {
        setGeminiTestResult(
          `Gemini API 오류: 처리 실패 - ${
            result.processedText || "알 수 없는 오류"
          }`
        );
      }
    } catch (error) {
      setGeminiTestResult(
        `예외 발생: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  useEffect(() => {
    const checkChromeAPI = () => {
      const info = {
        chrome: typeof window.chrome,
        identity: typeof window.chrome?.identity,
        runtime: typeof window.chrome?.runtime,
        identityMethods: Object.keys(window.chrome?.identity || {}).join(", "),
      };
      setChromeInfo(JSON.stringify(info, null, 2));
    };
    checkChromeAPI();
  }, []);

  return (
    <>
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Chrome API 상태:</p>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
          {chromeInfo}
        </pre>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium mb-2">
          Google Sheets API 테스트 결과:
        </p>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto min-h-[50px]">
          {apiTestResult || "아직 테스트하지 않음"}
        </pre>
      </div>

      <button
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors mb-4"
        type="button"
        onClick={handleTestGoogleAPI}
      >
        Google Sheets API 테스트
      </button>

      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Gemini API 테스트 결과:</p>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto min-h-[50px]">
          {geminiTestResult || "아직 테스트하지 않음"}
        </pre>
      </div>

      <button
        className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors mb-6"
        type="button"
        onClick={handleTestGeminiAPI}
        disabled={!geminiApiKey.trim()}
      >
        Gemini API 테스트
      </button>
    </>
  );
}

export default TestContents;
