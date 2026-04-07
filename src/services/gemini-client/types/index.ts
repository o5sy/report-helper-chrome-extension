export interface GeminiConfig {
  apiKey: string;
  model?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export interface TextProcessingRequest {
  prompt: string;
  // ? type이 왜있지?
  type: 'refine' | 'feedback';
}

export interface TextProcessingResponse {
  success: boolean;
  processedText: string;
  originalText: string;
  processingType: 'refine' | 'feedback';
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
  };
}
