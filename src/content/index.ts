import { SheetDetector } from "@/services/sheet-detector";

/**
 * Content Script 메인 진입점
 * Google Sheets 페이지에서 스프레드시트 정보를 감지하고 Background Script로 전송
 */
function initContentScript(): void {
  const detector = new SheetDetector();

  // Google Sheets 페이지인지 확인
  if (!detector.isGoogleSheetsPage()) {
    return;
  }

  // 페이지 로드 완료 후 시트 정보 감지 및 전송
  function detectAndSendSheetInfo(): void {
    try {
      detector.sendSheetInfoToBackground();
    } catch (error) {
      console.error("Error detecting sheet info:", error);
    }
  }

  // 초기 감지
  detectAndSendSheetInfo();

  // URL 변경 감지 (시트 간 이동)
  let currentUrl = window.location.href;

  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      // 시트 변경시 약간의 지연 후 재감지
      setTimeout(detectAndSendSheetInfo, 500);
    }
  });

  // DOM 변경 감지 시작
  urlObserver.observe(document, {
    subtree: true,
    childList: true,
  });

  // 페이지 언로드시 옵저버 정리
  window.addEventListener("beforeunload", () => {
    urlObserver.disconnect();
  });
}

// Content Script 실행
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initContentScript);
} else {
  initContentScript();
}
