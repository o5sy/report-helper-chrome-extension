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
