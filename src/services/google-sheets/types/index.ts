export interface ApiResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  properties: {
    title: string;
  };
  sheets: Array<{
    properties: {
      title: string;
    };
  }>;
}

export interface RangeData {
  range: string;
  values?: string[][];
}

export interface AppendResult {
  spreadsheetId: string;
  updates: {
    updatedRows: number;
  };
}
