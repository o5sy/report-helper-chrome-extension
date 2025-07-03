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

export interface GetSettingsMessage {
  type: "GET_SETTINGS";
  payload: Record<string, unknown>;
}

export interface ReportGeneratedMessage {
  type: "REPORT_GENERATED";
  payload: {
    reportId: string;
    url?: string;
    status?: string;
  };
}

export interface SheetInfoDetectedMessage {
  type: "SHEET_INFO_DETECTED";
  data: {
    spreadsheetId: string | null;
    sheetName: string;
    url: string;
  };
}

export interface RefineAnswersMessage {
  type: "REFINE_ANSWERS";
  payload: {
    spreadsheetId: string;
    sourceRange: string;
    targetRange: string;
    customPrompt?: string;
  };
}

export interface MessageResponse {
  success: boolean;
  type: string;
  data?: unknown;
  error?: string;
}

export type ExtensionMessage =
  | ReportGenerationMessage
  | GetSettingsMessage
  | ReportGeneratedMessage
  | SheetInfoDetectedMessage
  | RefineAnswersMessage;

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

// Work Queue Types
export interface WorkItem {
  id: string;
  type: "GENERATE_REPORT" | "PROCESS_DATA" | "SYNC_SHEETS";
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: number;
  updatedAt?: number;
  error?: string;
  retryCount?: number;
}

export interface StorageResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

// Answer Refinement Types
export interface AnswerData {
  originalAnswer: string;
  refinedAnswer: string;
  needsRefinement: boolean;
  rowIndex: number;
}

export interface RefinementResult {
  success: boolean;
  refinedText?: string;
  error?: string;
}

export interface WriteResult {
  success: boolean;
  updatedCount?: number;
  error?: string;
}

export interface BatchRefinementOptions {
  spreadsheetId: string;
  sourceRange: string;
  targetRange: string;
  customPrompt?: string;
}

export interface BatchRefinementResult {
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors?: string[];
}

// Feedback Generation Types
export interface BasicFeedbackRequest {
  question: string;
  answer: string;
  language: PromptLanguage;
  context?: string;
}

export interface PersonalizedFeedbackRequest {
  question: string;
  answer: string;
  pastFeedbacks: string[];
  language: PromptLanguage;
  context?: string;
}

export interface FeedbackResult {
  success: boolean;
  feedback?: string;
  error?: string;
  isPersonalized?: boolean;
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
  };
}

export interface FeedbackPattern {
  commonPhrases: string[];
  tone: "formal" | "casual" | "encouraging" | "critical" | "neutral";
  focusAreas: string[];
  averageLength: number;
}

export interface SheetFeedbackData {
  spreadsheetId: string;
  sheetName: string;
  questionColumn: number;
  answerColumn: number;
  feedbackColumn: number;
  startRow: number;
  endRow?: number;
}
