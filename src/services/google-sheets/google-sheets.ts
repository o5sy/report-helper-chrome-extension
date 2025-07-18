import type {
  ApiResult,
  AppendResult,
  RangeData,
  SpreadsheetMetadata,
} from "./types";

import type { GoogleAuthService } from "@/services/google-auth";

export class GoogleSheetsService {
  private readonly baseUrl = "https://sheets.googleapis.com/v4/spreadsheets";

  constructor(private authService: GoogleAuthService) {}

  // TODO 시트에 접근 가능한지 체크하는 용도로 사용하지 않는다면 삭제
  async getSpreadsheetMetadata(
    spreadsheetId: string,
  ): Promise<ApiResult<SpreadsheetMetadata>> {
    const authResult = await this.authService.getAccessToken();
    if (!authResult.success) {
      return {
        success: false,
        error: `Authentication failed: ${authResult.error}`,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/${spreadsheetId}`, {
        headers: {
          Authorization: `Bearer ${authResult.token}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API request failed: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async readRange(
    spreadsheetId: string,
    range: string,
  ): Promise<ApiResult<RangeData>> {
    const authResult = await this.authService.getAccessToken();
    if (!authResult.success) {
      return {
        success: false,
        error: `Authentication failed: ${authResult.error}`,
      };
    }

    try {
      const encodedRange = encodeURIComponent(range);
      const response = await fetch(
        `${this.baseUrl}/${spreadsheetId}/values/${encodedRange}`,
        {
          headers: {
            Authorization: `Bearer ${authResult.token}`,
          },
        },
      );

      if (!response.ok) {
        return {
          success: false,
          error: `API request failed: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async updateRange(
    spreadsheetId: string,
    range: string,
    values: string[][],
  ): Promise<ApiResult<AppendResult>> {
    const authResult = await this.authService.getAccessToken();
    if (!authResult.success) {
      return {
        success: false,
        error: `Authentication failed: ${authResult.error}`,
      };
    }

    try {
      const encodedRange = encodeURIComponent(range);
      const response = await fetch(
        `${this.baseUrl}/${spreadsheetId}/values/${encodedRange}?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authResult.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values }),
        },
      );

      if (!response.ok) {
        return {
          success: false,
          error: `API request failed: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: `Request failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}
