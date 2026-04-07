import { ExtensionMessage, MessageResponse, SyncReferenceMessage } from "./types";

import { ApiOrchestrator } from "@/background/api-orchestrator";

export class MessageHandler {
  private apiOrchestrator: ApiOrchestrator;

  constructor() {
    this.apiOrchestrator = new ApiOrchestrator();
  }

  async handleMessage(message: ExtensionMessage): Promise<MessageResponse> {
    try {
      switch (message.type) {
        case "REFINE_ANSWERS":
          return await this.handleRefineAnswers(message);
        case "GENERATE_FEEDBACK":
          return await this.handleGenerateFeedback(message);
        case "SYNC_REFERENCE":
          return await this.handleSyncReference(message);
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
    message: ExtensionMessage & { type: "REFINE_ANSWERS" },
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

  private async handleSyncReference(
    message: SyncReferenceMessage,
  ): Promise<MessageResponse> {
    try {
      const result = await this.apiOrchestrator.syncReference(message.payload.urlsText);
      return {
        success: result.success,
        type: "SYNC_REFERENCE_RESPONSE",
        data: result,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        type: "SYNC_REFERENCE_RESPONSE",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private async handleGenerateFeedback(
    message: ExtensionMessage & { type: "GENERATE_FEEDBACK" },
  ): Promise<MessageResponse> {
    try {
      const result = await this.apiOrchestrator.generateFeedback({
        spreadsheetId: message.payload.spreadsheetId,
        sourceRange: {
          questionRange: message.payload.sourceRange.questionRange,
          answerRange: message.payload.sourceRange.answerRange,
        },
        targetRange: message.payload.targetRange,
      });

      return {
        success: result.success,
        type: "GENERATE_FEEDBACK_RESPONSE",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        type: "GENERATE_FEEDBACK_RESPONSE",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
