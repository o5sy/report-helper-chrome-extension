import { GoogleAuthService } from "@/services/google-auth";
import { GoogleSheetsService } from "@/services/google-sheets";

export class GoogleServiceFactory {
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
