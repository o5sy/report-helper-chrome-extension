import type { GeminiConfig, TextProcessingRequest } from "../types";
import React, { useEffect, useState } from "react";

import { GeminiClient } from "../services/gemini-client";
import { GoogleAuthService } from "../services/google-auth";
import { GoogleSheetsService } from "../services/google-sheets";

export const Popup: React.FC = () => {
  const [chromeInfo, setChromeInfo] = useState<string>("확인 중...");
  const [apiTestResult, setApiTestResult] = useState<string>("");
  const [geminiTestResult, setGeminiTestResult] = useState<string>("");
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");

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

    // 저장된 Gemini API 키 불러오기
    const loadGeminiApiKey = async () => {
      try {
        if (window.chrome?.storage?.local) {
          const result = await window.chrome.storage.local.get([
            "geminiApiKey",
          ]);
          if (result.geminiApiKey) {
            setGeminiApiKey(result.geminiApiKey);
          }
        }
      } catch (error) {
        console.log("API 키 로드 실패:", error);
      }
    };

    checkChromeAPI();
    loadGeminiApiKey();
  }, []);

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

  const handleGeminiApiKeyChange = async (value: string) => {
    setGeminiApiKey(value);
    // API 키를 로컬 스토리지에 저장
    try {
      if (window.chrome?.storage?.local) {
        await window.chrome.storage.local.set({ geminiApiKey: value });
      }
    } catch (error) {
      console.log("API 키 저장 실패:", error);
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

  return (
    <div className="w-96 p-4 bg-background text-foreground max-h-[600px] overflow-y-auto">
      <h1 className="text-xl font-bold mb-4">Report Generator</h1>

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

      <div className="mb-4 border-t pt-4">
        <p className="text-sm font-medium mb-2">Gemini API 설정:</p>
        <input
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
          placeholder="Gemini API 키를 입력하세요"
          value={geminiApiKey}
          onChange={(e) => handleGeminiApiKeyChange(e.target.value)}
        />
        <p className="text-xs text-gray-500 mb-3">
          API 키는 브라우저에만 저장되며 외부로 전송되지 않습니다.
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Gemini API 테스트 결과:</p>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto min-h-[50px]">
          {geminiTestResult || "아직 테스트하지 않음"}
        </pre>
      </div>

      <button
        className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
        type="button"
        onClick={handleTestGeminiAPI}
        disabled={!geminiApiKey.trim()}
      >
        Gemini API 테스트
      </button>
    </div>
  );
};
