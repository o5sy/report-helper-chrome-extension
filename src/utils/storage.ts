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
};

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
