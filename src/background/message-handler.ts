import type { ExtensionMessage, MessageResponse } from "../types";

import { ApiOrchestrator } from "./api-orchestrator";

export class MessageHandler {
  private apiOrchestrator: ApiOrchestrator;

  constructor() {
    this.apiOrchestrator = new ApiOrchestrator();
  }

  async handleMessage(
    message: ExtensionMessage
    // sender: chrome.runtime.MessageSender
  ): Promise<MessageResponse> {
    try {
      switch (message.type) {
        case "REFINE_ANSWERS":
          return await this.handleRefineAnswers(message);
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

  private async handleRefineAnswers(
    message: ExtensionMessage & { type: "REFINE_ANSWERS" }
  ): Promise<MessageResponse> {
    try {
      const result = await this.apiOrchestrator.refineAnswers({
        spreadsheetId: message.payload.spreadsheetId,
        sourceRange: message.payload.sourceRange,
        targetRange: message.payload.targetRange,
        customPrompt: message.payload.customPrompt,
      });

      return {
        success: result.success,
        type: "REFINE_ANSWERS_RESPONSE",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        type: "REFINE_ANSWERS_RESPONSE",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // async sendMessageToTab(
  //   tabId: number,
  //   message: ExtensionMessage
  // ): Promise<MessageResponse> {
  //   try {
  //     const response = await chrome.tabs.sendMessage(tabId, message);
  //     return response || { success: true, type: "MESSAGE_SENT" };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       type: "ERROR_RESPONSE",
  //       error:
  //         error instanceof Error ? error.message : "Failed to send message",
  //     };
  //   }
  // }

  // async sendMessageToRuntime(
  //   message: ExtensionMessage
  // ): Promise<MessageResponse> {
  //   try {
  //     const response = await chrome.runtime.sendMessage(message);
  //     return response || { success: true, type: "MESSAGE_SENT" };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       type: "ERROR_RESPONSE",
  //       error:
  //         error instanceof Error ? error.message : "Failed to send message",
  //     };
  //   }
  // }
}
