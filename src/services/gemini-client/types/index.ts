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
