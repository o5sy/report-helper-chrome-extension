import { ExtensionSettings, UserPreferences } from "../types";

// Chrome API 타입 선언
declare const chrome: {
  storage: {
    local: {
      get: (key: string) => Promise<Record<string, unknown>>;
      set: (items: Record<string, unknown>) => Promise<void>;
    };
    sync: {
      get: (key: string) => Promise<Record<string, unknown>>;
      set: (items: Record<string, unknown>) => Promise<void>;
    };
  };
  tabs: {
    query: (queryInfo: {
      active: boolean;
      currentWindow: boolean;
    }) => Promise<Array<{ url?: string }>>;
  };
};

/**
 * Extract spreadsheet ID from Google Sheets URL
 */
export function extractSpreadsheetId(url: string): string | null {
  const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Get current active tab URL and extract spreadsheet ID if it's a Google Sheets page
 */
export async function getCurrentSpreadsheetId(): Promise<string | null> {
  try {
    if (!chrome?.tabs?.query) {
      return null;
    }

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];

    if (!currentTab?.url) {
      return null;
    }

    // Check if it's a Google Sheets URL
    if (!currentTab.url.includes("docs.google.com/spreadsheets")) {
      return null;
    }

    return extractSpreadsheetId(currentTab.url);
  } catch (error) {
    console.error("Failed to get current spreadsheet ID:", error);
    return null;
  }
}

export class StorageManager {
  private readonly defaultSettings: ExtensionSettings = {
    autoGenerate: false,
    reportFormat: "markdown",
    maxReportLength: 1000,
  };

  private readonly defaultPreferences: UserPreferences = {
    theme: "auto",
    language: "en",
  };

  async getSettings(): Promise<ExtensionSettings> {
    const result = await chrome.storage.local.get("settings");
    return (result.settings as ExtensionSettings) || this.defaultSettings;
  }

  async setSettings(settings: ExtensionSettings): Promise<void> {
    await chrome.storage.local.set({ settings });
  }

  async getUserPreferences(): Promise<UserPreferences> {
    const result = await chrome.storage.sync.get("userPreferences");
    return (
      (result.userPreferences as UserPreferences) || this.defaultPreferences
    );
  }

  async setUserPreferences(preferences: UserPreferences): Promise<void> {
    await chrome.storage.sync.set({ userPreferences: preferences });
  }
}
