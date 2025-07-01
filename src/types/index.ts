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

// Google Sheets Integration Types
export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  range: string;
}

export interface ReportEntry {
  date: string;
  url: string;
  title: string;
  content: string;
  timestamp?: number;
}

// Gemini AI API Types
export interface GeminiConfig {
  apiKey: string;
  model?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export interface TextProcessingRequest {
  text: string;
  type: "refine" | "feedback";
  context?: string;
}

export interface TextProcessingResponse {
  success: boolean;
  processedText: string;
  originalText: string;
  processingType: "refine" | "feedback";
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
  };
}

export interface GeminiApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Prompt Template Types
export type PromptLanguage = "ko" | "en";
export type PromptStyle = "formal" | "casual" | "academic" | "business";
export type FocusArea =
  | "clarity"
  | "structure"
  | "grammar"
  | "tone"
  | "style"
  | "logic";

export interface RefinePromptOptions {
  text: string;
  language: PromptLanguage;
  style: PromptStyle;
  context?: string;
  customRules?: string[];
  maxLength?: number;
  costOptimized?: boolean;
}

export interface FeedbackPromptOptions {
  text: string;
  language: PromptLanguage;
  focusAreas: FocusArea[];
  criteria?: Record<string, string>;
  context?: string;
  costOptimized?: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  language: PromptLanguage;
  category: "refine" | "feedback";
}

// Response Processing Types
export interface ProcessedResponse {
  content: string;
  quality: QualityMetrics;
  metadata: ResponseMetadata;
  isValid: boolean;
  errors?: string[];
}

export interface QualityMetrics {
  score: number; // 0-100
  readability: number;
  coherence: number;
  completeness: number;
  accuracy: number;
}

export interface ResponseMetadata {
  processingTime: number;
  tokensUsed: number;
  modelUsed: string;
  promptTokens?: number;
  completionTokens?: number;
  confidence?: number;
}

export interface ValidationRule {
  name: string;
  description: string;
  validator: (text: string) => boolean;
  errorMessage: string;
  severity: "error" | "warning";
}

export interface ResponseParseOptions {
  validateStructure?: boolean;
  extractMetadata?: boolean;
  checkQuality?: boolean;
  minQualityScore?: number;
  customValidators?: ValidationRule[];
}
