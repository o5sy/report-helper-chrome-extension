import type { ExtensionMessage, MessageResponse } from "../types";

export class MessageHandler {
  async handleMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender
  ): Promise<MessageResponse> {
    try {
      switch (message.type) {
        case "GENERATE_REPORT":
          return await this.handleGenerateReport(message, sender);
        case "GET_SETTINGS":
          return await this.handleGetSettings(message, sender);
        case "REPORT_GENERATED":
          return await this.handleReportGenerated(message, sender);
        case "SHEET_INFO_DETECTED":
          return await this.handleSheetInfoDetected(message, sender);
        default:
          return {
            success: false,
            type: "ERROR_RESPONSE",
            error: "Unknown message type",
          };
      }
    } catch (error) {
      return {
        success: false,
        type: "ERROR_RESPONSE",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async handleGenerateReport(
    message: ExtensionMessage & { type: "GENERATE_REPORT" },
    sender: chrome.runtime.MessageSender
  ): Promise<MessageResponse> {
    // TODO: 실제 리포트 생성 로직 구현
    return {
      success: true,
      type: "GENERATE_REPORT_RESPONSE",
      data: {
        reportId: "temp-id",
        status: "processing",
      },
    };
  }

  private async handleGetSettings(
    message: ExtensionMessage & { type: "GET_SETTINGS" },
    sender: chrome.runtime.MessageSender
  ): Promise<MessageResponse> {
    // TODO: 실제 설정 조회 로직 구현
    return {
      success: true,
      type: "GET_SETTINGS_RESPONSE",
      data: {
        autoGenerate: true,
        reportFormat: "markdown",
      },
    };
  }

  private async handleReportGenerated(
    message: ExtensionMessage & { type: "REPORT_GENERATED" },
    sender: chrome.runtime.MessageSender
  ): Promise<MessageResponse> {
    // TODO: 리포트 생성 완료 처리 로직 구현
    return {
      success: true,
      type: "REPORT_GENERATED_RESPONSE",
      data: message.payload,
    };
  }

  private async handleSheetInfoDetected(
    message: ExtensionMessage & { type: "SHEET_INFO_DETECTED" },
    sender: chrome.runtime.MessageSender
  ): Promise<MessageResponse> {
    // Content Script에서 전송된 Google Sheets 정보 처리
    console.log("Sheet info detected:", message.data);

    // 현재는 단순히 로그만 출력하고 성공 응답 반환 (MVP)
    return {
      success: true,
      type: "SHEET_INFO_DETECTED_RESPONSE",
      data: message.data,
    };
  }

  async sendMessageToTab(
    tabId: number,
    message: ExtensionMessage
  ): Promise<MessageResponse> {
    try {
      const response = await chrome.tabs.sendMessage(tabId, message);
      return response || { success: true, type: "MESSAGE_SENT" };
    } catch (error) {
      return {
        success: false,
        type: "ERROR_RESPONSE",
        error:
          error instanceof Error ? error.message : "Failed to send message",
      };
    }
  }

  async sendMessageToRuntime(
    message: ExtensionMessage
  ): Promise<MessageResponse> {
    try {
      const response = await chrome.runtime.sendMessage(message);
      return response || { success: true, type: "MESSAGE_SENT" };
    } catch (error) {
      return {
        success: false,
        type: "ERROR_RESPONSE",
        error:
          error instanceof Error ? error.message : "Failed to send message",
      };
    }
  }
}
