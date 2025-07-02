import type {
  FeedbackPromptOptions,
  GeminiConfig,
  RefinePromptOptions,
  TextProcessingRequest,
  TextProcessingResponse,
} from "../types";

import { GoogleGenAI } from "@google/genai";
import { PromptTemplateManager } from "./prompt-templates";

export class GeminiClient {
  private ai: GoogleGenAI;
  private config: GeminiConfig;
  private promptManager: PromptTemplateManager;

  constructor(config: GeminiConfig) {
    if (!config.apiKey || config.apiKey.trim() === "") {
      throw new Error("API key is required");
    }

    this.config = {
      model: "gemini-1.5-flash",
      maxOutputTokens: 1000,
      temperature: 0.7,
      ...config,
    };

    this.ai = new GoogleGenAI({
      apiKey: this.config.apiKey,
    });

    this.promptManager = new PromptTemplateManager();
  }

  async processText(
    request: TextProcessingRequest
  ): Promise<TextProcessingResponse> {
    const startTime = Date.now();

    try {
      const prompt = this.buildPrompt(request);

      const response = await this.ai.models.generateContent({
        model: this.config.model!,
        contents: prompt,
        config: {
          maxOutputTokens: this.config.maxOutputTokens,
          temperature: this.config.temperature,
        },
      });

      const processedText = response.text?.trim() || "";
      const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        processedText,
        originalText: request.text,
        processingType: request.type,
        metadata: {
          tokensUsed,
          processingTime,
        },
      };
    } catch (error) {
      console.error("Gemini API error:", error);

      return {
        success: false,
        processedText: "",
        originalText: request.text,
        processingType: request.type,
        metadata: {
          processingTime: Date.now() - startTime,
        },
      };
    }
  }

  private buildPrompt(request: TextProcessingRequest): string {
    const { text, type, context } = request;

    switch (type) {
      case "refine":
        // return this.buildRefinePrompt(text, context);
        return `${context}\n\n---\n\n${text}`;
      case "feedback":
        return this.buildFeedbackPrompt(text, context);
      default:
        throw new Error(`Unsupported processing type: ${type}`);
    }
  }

  private buildRefinePrompt(text: string, context?: string): string {
    const options: RefinePromptOptions = {
      text,
      language: "ko",
      style: "formal",
      context,
      costOptimized: true, // 비용 최적화 설정
    };

    return this.promptManager.createRefinePrompt(options);
  }

  private buildFeedbackPrompt(text: string, context?: string): string {
    const options: FeedbackPromptOptions = {
      text,
      language: "ko",
      focusAreas: ["clarity", "structure", "grammar"],
      context,
      costOptimized: true, // 비용 최적화 설정
    };

    return this.promptManager.createFeedbackPrompt(options);
  }
}
