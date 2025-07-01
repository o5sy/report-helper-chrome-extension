import type {
  FeedbackPromptOptions,
  FocusArea,
  PromptLanguage,
  PromptStyle,
  RefinePromptOptions,
} from "../types";

export class PromptTemplateManager {
  private readonly SUPPORTED_LANGUAGES: PromptLanguage[] = ["ko", "en"];
  private readonly SUPPORTED_STYLES: PromptStyle[] = [
    "formal",
    "casual",
    "academic",
    "business",
  ];
  private readonly FOCUS_AREAS_MAP: Record<
    FocusArea,
    { ko: string; en: string }
  > = {
    clarity: { ko: "명확성", en: "clarity" },
    structure: { ko: "구조", en: "structure" },
    grammar: { ko: "문법", en: "grammar" },
    tone: { ko: "톤", en: "tone" },
    style: { ko: "스타일", en: "style" },
    logic: { ko: "논리성", en: "logic" },
  };

  createRefinePrompt(options: RefinePromptOptions): string {
    this.validateRefineOptions(options);

    const {
      text,
      language,
      style,
      context,
      customRules,
      maxLength,
      costOptimized,
    } = options;
    const processedText = maxLength ? this.truncateText(text, maxLength) : text;

    if (language === "ko") {
      return this.createKoreanRefinePrompt(
        processedText,
        style,
        context,
        customRules,
        costOptimized
      );
    } else {
      return this.createEnglishRefinePrompt(
        processedText,
        style,
        context,
        customRules,
        costOptimized
      );
    }
  }

  createFeedbackPrompt(options: FeedbackPromptOptions): string {
    this.validateFeedbackOptions(options);

    const { text, language, focusAreas, criteria, context, costOptimized } =
      options;

    if (language === "ko") {
      return this.createKoreanFeedbackPrompt(
        text,
        focusAreas,
        criteria,
        context,
        costOptimized
      );
    } else {
      return this.createEnglishFeedbackPrompt(
        text,
        focusAreas,
        criteria,
        context,
        costOptimized
      );
    }
  }

  private validateRefineOptions(options: RefinePromptOptions): void {
    if (!options.text || options.text.trim() === "") {
      throw new Error("Text is required");
    }

    if (!this.SUPPORTED_LANGUAGES.includes(options.language)) {
      throw new Error("Unsupported language");
    }

    if (!this.SUPPORTED_STYLES.includes(options.style)) {
      throw new Error("Unsupported style");
    }
  }

  private validateFeedbackOptions(options: FeedbackPromptOptions): void {
    if (!options.text || options.text.trim() === "") {
      throw new Error("Text is required");
    }

    if (!this.SUPPORTED_LANGUAGES.includes(options.language)) {
      throw new Error("Unsupported language");
    }

    if (!options.focusAreas || options.focusAreas.length === 0) {
      throw new Error("At least one focus area is required");
    }
  }

  private createKoreanRefinePrompt(
    text: string,
    style: PromptStyle,
    context?: string,
    customRules?: string[],
    costOptimized?: boolean
  ): string {
    const styleGuide = this.getKoreanStyleGuide(style);
    const rules = costOptimized
      ? this.getBasicRefineRules()
      : this.getDetailedRefineRules();

    let prompt = costOptimized
      ? "텍스트를 정제하고 개선해주세요:\n\n"
      : "텍스트를 정제하고 개선해주세요. 다음 지침을 따라주세요:\n\n";

    prompt += rules;
    prompt += `\n스타일: ${styleGuide}`;

    if (context) {
      prompt += `\n컨텍스트: ${context}`;
    }

    if (customRules && customRules.length > 0) {
      prompt += "\n\n추가 규칙:\n";
      customRules.forEach((rule, index) => {
        prompt += `${index + 1}. ${rule}\n`;
      });
    }

    prompt += `\n\n원본 텍스트:\n${text}\n\n정제된 텍스트:`;

    return prompt.trim();
  }

  private createEnglishRefinePrompt(
    text: string,
    style: PromptStyle,
    context?: string,
    customRules?: string[],
    costOptimized?: boolean
  ): string {
    const styleGuide = this.getEnglishStyleGuide(style);
    const rules = costOptimized
      ? this.getBasicRefineRulesEn()
      : this.getDetailedRefineRulesEn();

    let prompt = costOptimized
      ? "Please refine and improve the text:\n\n"
      : "Please refine and improve the text following these guidelines:\n\n";

    prompt += rules;
    prompt += `\nStyle: ${styleGuide}`;

    if (context) {
      prompt += `\nContext: ${context}`;
    }

    if (customRules && customRules.length > 0) {
      prompt += "\n\nAdditional rules:\n";
      customRules.forEach((rule, index) => {
        prompt += `${index + 1}. ${rule}\n`;
      });
    }

    prompt += `\n\nOriginal text:\n${text}\n\nRefined text:`;

    return prompt.trim();
  }

  private createKoreanFeedbackPrompt(
    text: string,
    focusAreas: FocusArea[],
    criteria?: Record<string, string>,
    context?: string,
    costOptimized?: boolean
  ): string {
    let prompt = costOptimized
      ? "다음 텍스트에 대한 피드백을 제공해주세요:\n\n"
      : "다음 텍스트에 대한 건설적인 피드백을 제공해주세요:\n\n";

    if (!costOptimized) {
      prompt += "평가 항목:\n";
      focusAreas.forEach((area, index) => {
        const areaName = this.FOCUS_AREAS_MAP[area].ko;
        prompt += `${index + 1}. ${areaName}\n`;
      });
    }

    if (criteria) {
      prompt += "\n세부 평가 기준:\n";
      Object.entries(criteria).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    if (context) {
      prompt += `\n컨텍스트: ${context}`;
    }

    prompt += `\n\n분석할 텍스트:\n${text}\n\n피드백:`;

    return prompt.trim();
  }

  private createEnglishFeedbackPrompt(
    text: string,
    focusAreas: FocusArea[],
    criteria?: Record<string, string>,
    context?: string,
    costOptimized?: boolean
  ): string {
    let prompt = costOptimized
      ? "Please provide feedback on the following text:\n\n"
      : "Please provide constructive feedback on the following text:\n\n";

    if (!costOptimized) {
      prompt += "Evaluation areas:\n";
      focusAreas.forEach((area, index) => {
        const areaName = this.FOCUS_AREAS_MAP[area].en;
        prompt += `${index + 1}. ${areaName}\n`;
      });
    }

    if (criteria) {
      prompt += "\nDetailed criteria:\n";
      Object.entries(criteria).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });
    }

    if (context) {
      prompt += `\nContext: ${context}`;
    }

    prompt += `\n\nText to analyze:\n${text}\n\nFeedback:`;

    return prompt.trim();
  }

  private getKoreanStyleGuide(style: PromptStyle): string {
    const guides = {
      formal: "정중하고 격식있는 문체",
      casual: "친근하고 자연스러운 문체",
      academic: "학술적이고 객관적인 문체",
      business: "비즈니스에 적합한 전문적인 문체",
    };
    return guides[style];
  }

  private getEnglishStyleGuide(style: PromptStyle): string {
    const guides = {
      formal: "formal and respectful tone",
      casual: "friendly and natural tone",
      academic: "academic and objective tone",
      business: "professional business tone",
    };
    return guides[style];
  }

  private getBasicRefineRules(): string {
    return "1. 문법과 맞춤법 교정\n2. 가독성 개선\n3. 의미 유지";
  }

  private getDetailedRefineRules(): string {
    return `1. 문법과 맞춤법을 교정하세요
2. 문장 구조를 개선하여 가독성을 높이세요
3. 불필요한 반복을 제거하세요
4. 내용의 논리적 흐름을 개선하세요
5. 원본의 의미와 톤을 유지하세요`;
  }

  private getBasicRefineRulesEn(): string {
    return "1. Fix grammar and spelling\n2. Improve readability\n3. Maintain meaning";
  }

  private getDetailedRefineRulesEn(): string {
    return `1. Correct grammar and spelling errors
2. Improve sentence structure for better readability
3. Remove unnecessary repetition
4. Enhance logical flow of content
5. Maintain original meaning and tone`;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    const truncated = text.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(" ");

    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + "...";
    }

    return truncated + "...";
  }
}
