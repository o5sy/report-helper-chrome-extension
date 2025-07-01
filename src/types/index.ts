export interface ReportGenerationMessage {
  type: "GENERATE_REPORT";
  payload?: {
    url?: string;
    title?: string;
  };
}

export interface ReportGenerationResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export type ExtensionMessage = ReportGenerationMessage;

export interface TabInfo {
  id?: number;
  url?: string;
  title?: string;
}

// Chrome Storage 관련 타입 정의
export interface StorageData {
  settings?: ExtensionSettings;
  userPreferences?: UserPreferences;
}

export interface ExtensionSettings {
  autoGenerate: boolean;
  reportFormat: "markdown" | "pdf" | "html";
  maxReportLength: number;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
}

export interface StorageError {
  code: "QUOTA_EXCEEDED" | "STORAGE_DISABLED" | "UNKNOWN_ERROR";
  message: string;
}
