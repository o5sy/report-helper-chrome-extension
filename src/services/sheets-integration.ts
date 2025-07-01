import type { ApiResult, GoogleSheetsService } from "./google-sheets";

import type { GoogleAuthService } from "./google-auth";

export interface AccessValidationResult {
  success: boolean;
  canRead: boolean;
  canWrite?: boolean;
  error?: string;
}

export interface ReportData {
  date: string;
  url: string;
  title: string;
  content: string;
}

export interface ParsedSpreadsheetData {
  headers: string[];
  rows: string[][];
}

export interface DataIntegrityResult {
  isValid: boolean;
  conflicts: string[];
}

export class SheetsIntegrationService {
  constructor(
    private sheetsService: GoogleSheetsService,
    private authService: GoogleAuthService
  ) {}

  async validateSpreadsheetAccess(
    spreadsheetId: string
  ): Promise<AccessValidationResult> {
    try {
      const result = await this.sheetsService.getSpreadsheetMetadata(
        spreadsheetId
      );

      if (!result.success) {
        return {
          success: false,
          canRead: false,
          error: `Spreadsheet access validation failed: ${result.error}`,
        };
      }

      return {
        success: true,
        canRead: true,
        canWrite: true,
      };
    } catch (error) {
      return {
        success: false,
        canRead: false,
        error: `Validation error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async readExistingReport(
    spreadsheetId: string,
    range: string
  ): Promise<ApiResult<ParsedSpreadsheetData>> {
    try {
      const result = await this.sheetsService.readRange(spreadsheetId, range);

      if (!result.success) {
        return {
          success: false,
          error: `Failed to read existing report: ${result.error}`,
        };
      }

      const values = result.data?.values || [];
      const headers = values.length > 0 ? values[0] : [];
      const rows = values.length > 1 ? values.slice(1) : [];

      return {
        success: true,
        data: {
          headers,
          rows,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Read operation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async appendNewReport(
    spreadsheetId: string,
    range: string,
    reportData: ReportData
  ): Promise<ApiResult<{ updatedRows: number }>> {
    try {
      const rowData = [
        reportData.date,
        reportData.url,
        reportData.title,
        reportData.content,
      ];

      const result = await this.sheetsService.appendData(spreadsheetId, range, [
        rowData,
      ]);

      if (!result.success) {
        return {
          success: false,
          error: `Failed to append new report: ${result.error}`,
        };
      }

      return {
        success: true,
        data: {
          updatedRows: result.data?.updates?.updatedRows || 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Append operation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  ensureDataIntegrity(
    existingData: string[][],
    newData: string[][]
  ): DataIntegrityResult {
    const conflicts: string[] = [];

    if (existingData.length === 0) {
      return { isValid: true, conflicts: [] };
    }

    // Simple conflict detection: check if new data would duplicate existing entries
    // Based on first two columns (date, url) as unique identifiers
    const existingEntries = new Set(
      existingData.slice(1).map((row) => `${row[0]}-${row[1]}`)
    );

    newData.forEach((newRow, index) => {
      const key = `${newRow[0]}-${newRow[1]}`;
      if (existingEntries.has(key)) {
        conflicts.push(
          `Row ${index + 1}: Duplicate entry detected for ${newRow[0]} - ${
            newRow[1]
          }`
        );
      }
    });

    return {
      isValid: conflicts.length === 0,
      conflicts,
    };
  }
}
