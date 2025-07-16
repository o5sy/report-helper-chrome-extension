// MessageHandler 관련 타입
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

export type ExtensionMessage = RefineAnswersMessage | GenerateFeedbackMessage;

// Chrome Storage 관련 타입 정의
export interface ExtensionSettings {
  autoGenerate: boolean;
  reportFormat: "markdown" | "pdf" | "html";
  maxReportLength: number;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
}