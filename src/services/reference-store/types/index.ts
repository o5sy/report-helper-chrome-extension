export interface QuestionReference {
  examples: string[];
}

export interface ReferenceData {
  lastSynced: string;
  sourceSheetIds: string[];
  questions: Record<string, QuestionReference>;
  toneSystemPrompt: string;
}

export interface SyncResult {
  success: boolean;
  questionCount?: number;
  toneSystemPrompt?: string;
  error?: string;
}
