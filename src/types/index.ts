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
  data?: any;
}

export type ExtensionMessage = ReportGenerationMessage;

export interface TabInfo {
  id?: number;
  url?: string;
  title?: string;
}
