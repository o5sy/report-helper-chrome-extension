import type {
  BasicFeedbackRequest,
  FeedbackResult,
  GeminiConfig,
} from "../types";

import { GeminiClient } from "./gemini-client";

export class FeedbackGenerator {
  private geminiClient: GeminiClient;

  constructor(config: GeminiConfig) {
    if (!config.apiKey || config.apiKey.trim() === "") {
      throw new Error("API key is required");
    }
    this.geminiClient = new GeminiClient(config);
  }

  async generateBasicFeedback(
    request: BasicFeedbackRequest
  ): Promise<FeedbackResult> {
    const startTime = Date.now();

    try {
      // Validate input
      if (!request.question?.trim() || !request.answer?.trim()) {
        return {
          success: false,
          error: "Question and answer are required",
        };
      }

      const prompt = this.buildBasicFeedbackPrompt(request);

      const response = await this.geminiClient.processText({
        text: prompt,
        type: "feedback",
        context: request.context,
      });

      if (!response.success) {
        return {
          success: false,
          error: `Feedback generation failed: ${
            response.processedText || "Unknown error"
          }`,
        };
      }

      return {
        success: true,
        feedback: response.processedText,
        isPersonalized: false,
        metadata: {
          tokensUsed: response.metadata?.tokensUsed || 0,
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Feedback generation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        metadata: {
          processingTime: Date.now() - startTime,
        },
      };
    }
  }

  private buildBasicFeedbackPrompt(request: BasicFeedbackRequest): string {
    const { question, answer, language, context } = request;

    if (language === "ko") {
      let prompt =
        "다음 질문과 답변에 대해 건설적인 피드백을 제공해주세요.\n\n";
      prompt += `질문: ${question}\n`;
      prompt += `답변: ${answer}\n\n`;

      if (context) {
        prompt += `컨텍스트: ${context}\n\n`;
      }

      prompt += "피드백 기준:\n";
      prompt += "- 내용의 정확성과 완성도\n";
      prompt += "- 답변의 명확성과 구체성\n";
      prompt += "- 논리적 구조와 흐름\n";
      prompt += "- 개선 방안 제시\n\n";
      prompt += "피드백:";

      return prompt;
    } else {
      let prompt =
        "Please provide constructive feedback for the following question and answer.\n\n";
      prompt += `Question: ${question}\n`;
      prompt += `Answer: ${answer}\n\n`;

      if (context) {
        prompt += `Context: ${context}\n\n`;
      }

      prompt += "Feedback criteria:\n";
      prompt += "- Accuracy and completeness of content\n";
      prompt += "- Clarity and specificity of the answer\n";
      prompt += "- Logical structure and flow\n";
      prompt += "- Suggestions for improvement\n\n";
      prompt += "Feedback:";

      return prompt;
    }
  }
}
