import { SheetInfo } from "./types";

export class SheetDetector {
  /**
   * Google Sheets URL에서 스프레드시트 ID를 추출
   */
  extractSpreadsheetId(): string | null {
    const url = window.location.href;
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }

  /**
   * 문서 제목에서 시트명을 추출
   */
  extractSheetName(): string {
    const title = document.title;
    const match = title.match(/^(.+?)\s*-\s*Google Sheets$/);
    return match ? match[1].trim() : "Untitled Spreadsheet";
  }

  /**
   * 현재 페이지가 Google Sheets인지 확인
   */
  isGoogleSheetsPage(): boolean {
    return (
      window.location.hostname === "docs.google.com" &&
      window.location.pathname.includes("/spreadsheets/")
    );
  }

  /**
   * 완전한 시트 정보 반환
   */
  getSheetInfo(): SheetInfo {
    return {
      spreadsheetId: this.extractSpreadsheetId(),
      sheetName: this.extractSheetName(),
      url: window.location.href,
    };
  }

  /**
   * Background Script로 시트 정보 전송
   */
  sendSheetInfoToBackground(): void {
    const sheetInfo = this.getSheetInfo();

    // Chrome extension API를 안전하게 접근
    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.sendMessage
    ) {
      chrome.runtime.sendMessage({
        type: "SHEET_INFO_DETECTED",
        data: sheetInfo,
      });
    }
  }
}
