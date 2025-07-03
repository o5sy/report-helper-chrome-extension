import { GoogleAuthService } from "./google-auth";
import { GoogleSheetsService } from "./google-sheets";
import { SheetsIntegrationService } from "./sheets-integration";

export class GoogleSheetsServiceFactory {
  private static authService: GoogleAuthService;
  private static sheetsService: GoogleSheetsService;
  private static integrationService: SheetsIntegrationService;

  static getAuthService(): GoogleAuthService {
    if (!this.authService) {
      this.authService = new GoogleAuthService();
    }
    return this.authService;
  }

  static getSheetsService(): GoogleSheetsService {
    if (!this.sheetsService) {
      this.sheetsService = new GoogleSheetsService(this.getAuthService());
    }
    return this.sheetsService;
  }

  static getIntegrationService(): SheetsIntegrationService {
    if (!this.integrationService) {
      this.integrationService = new SheetsIntegrationService(
        this.getSheetsService(),
        this.getAuthService()
      );
    }
    return this.integrationService;
  }

  static async isReady(): Promise<boolean> {
    try {
      const authService = this.getAuthService();
      return await authService.isAuthenticated();
    } catch {
      return false;
    }
  }
}

// Export all interfaces and types for easy import
export type { AuthResult } from "./google-auth";
export type {
  ApiResult,
  SpreadsheetMetadata,
  RangeData,
  AppendResult,
} from "./google-sheets";
export type {
  AccessValidationResult,
  ReportData,
  ParsedSpreadsheetData,
  DataIntegrityResult,
} from "./sheets-integration";

// Export classes for direct use if needed
export { GeminiClient } from "./gemini-client";
export { GoogleAuthService } from "./google-auth";
export { GoogleSheetsService } from "./google-sheets";
export { PromptTemplateManager } from "./prompt-templates";
export { ResponseParser } from "./response-parser";
export { SheetsIntegrationService } from "./sheets-integration";
export { AnswerRefiner } from "./answer-refiner";
export { FeedbackGenerator } from "./feedback-generator";
