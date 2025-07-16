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
