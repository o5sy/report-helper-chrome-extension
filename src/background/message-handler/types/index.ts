export interface RefineAnswersMessage {
  type: "REFINE_ANSWERS";
  payload: {
    spreadsheetId: string;
    sourceRange: string;
    targetRange: string;
    customPrompt?: string;
  };
}

export interface GenerateFeedbackMessage {
  type: "GENERATE_FEEDBACK";
  payload: {
    spreadsheetId: string;
    sourceRange: {
      questionRange: string;
      answerRange: string;
    };
    targetRange: string;
  };
}

export interface MessageResponse {
  success: boolean;
  type: string;
  data?: unknown;
  error?: string;
}

export interface SyncReferenceMessage {
  type: "SYNC_REFERENCE";
  payload: {
    urlsText: string;
  };
}

export type ExtensionMessage =
  | RefineAnswersMessage
  | GenerateFeedbackMessage
  | SyncReferenceMessage;
