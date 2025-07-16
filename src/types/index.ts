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

// Gemini AI API Types
export interface GeminiConfig {
  apiKey: string;
  model?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export interface TextProcessingRequest {
  prompt: string;
  type: "refine" | "feedback";
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
  customPrompt?: string;
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

export interface BatchFeedbackOptions {
  spreadsheetId: string;
  sourceRange: {
    questionRange: string;
    answerRange: string;
  };
  targetRange: string;
  customPrompt?: string;
  onProgress?: (current: number, total: number, currentRow: number) => void;
}

export interface BatchFeedbackResult {
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors?: string[];
}
