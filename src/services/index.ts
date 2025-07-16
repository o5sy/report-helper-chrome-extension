import { GoogleAuthService } from "./google-auth";
import { GoogleSheetsService } from "./google-sheets";

export class GoogleSheetsServiceFactory {
  private static authService: GoogleAuthService;
  private static sheetsService: GoogleSheetsService;

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
  AppendResult,
  RangeData,
  SpreadsheetMetadata,
} from "./google-sheets";

// Export classes for direct use if needed
export { AnswerRefiner } from "./answer-refiner";
export { FeedbackGenerator } from "./feedback-generator";
export { GeminiClient } from "./gemini-client";
export { GoogleAuthService } from "./google-auth";
export { GoogleSheetsService } from "./google-sheets";
