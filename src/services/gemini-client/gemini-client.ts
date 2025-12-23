import {
  GeminiConfig,
  TextProcessingRequest,
  TextProcessingResponse,
} from './types';

import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

export class GeminiClient {
  private ai: GoogleGenAI;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new Error('API key is required');
    }

    this.config = {
      model: DEFAULT_MODEL,
      maxOutputTokens: 1000,
      temperature: 0.7,
      ...config,
    };

    this.ai = new GoogleGenAI({
      apiKey: this.config.apiKey,
    });
  }

  async processText(
    request: TextProcessingRequest
  ): Promise<TextProcessingResponse> {
    const startTime = Date.now();

    try {
      const response = await this.ai.models.generateContent({
        model: this.config.model || DEFAULT_MODEL,
        contents: request.prompt,
        config: {
          maxOutputTokens: this.config.maxOutputTokens,
          temperature: this.config.temperature,
        },
      });

      const processedText = response.text?.trim() || '';
      const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        processedText,
        originalText: request.prompt,
        processingType: request.type,
        metadata: {
          tokensUsed,
          processingTime,
        },
      };
    } catch (error) {
      console.error('Gemini API error:', error);

      return {
        success: false,
        processedText: '',
        originalText: request.prompt,
        processingType: request.type,
        metadata: {
          processingTime: Date.now() - startTime,
        },
      };
    }
  }
}
