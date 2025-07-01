import React, { useEffect, useState } from "react";

import { GoogleAuthService } from "../services/google-auth";
import { GoogleSheetsService } from "../services/google-sheets";

export const Popup: React.FC = () => {
  const [chromeInfo, setChromeInfo] = useState<string>("확인 중...");
  const [apiTestResult, setApiTestResult] = useState<string>("");

  useEffect(() => {
    const checkChromeAPI = () => {
      const info = {
        chrome: typeof chrome,
        identity: typeof chrome?.identity,
        runtime: typeof chrome?.runtime,
        identityMethods: Object.keys(chrome?.identity || {}).join(", "),
      };
      setChromeInfo(JSON.stringify(info, null, 2));
    };
    checkChromeAPI();
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

  return (
    <div className="w-80 p-4 bg-background text-foreground">
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
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        type="button"
        onClick={handleTestGoogleAPI}
      >
        Google Sheets API 테스트
      </button>
    </div>
  );
};
