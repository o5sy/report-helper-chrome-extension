import { ExtensionSettings, UserPreferences } from "../types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StorageManager } from "./storage";

// Chrome API 모킹
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
  },
};

// @ts-expect-error Chrome API 모킹
global.chrome = mockChrome;

describe("StorageManager", () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    storageManager = new StorageManager();
    vi.clearAllMocks();
  });

  describe("getSettings", () => {
    it("should return default settings when no settings exist", async () => {
      mockChrome.storage.local.get.mockResolvedValue({});

      const settings = await storageManager.getSettings();

      expect(settings).toEqual({
        autoGenerate: false,
        reportFormat: "markdown",
        maxReportLength: 1000,
      });
    });

    it("should return stored settings when they exist", async () => {
      const storedSettings: ExtensionSettings = {
        autoGenerate: true,
        reportFormat: "pdf",
        maxReportLength: 2000,
      };
      mockChrome.storage.local.get.mockResolvedValue({
        settings: storedSettings,
      });

      const settings = await storageManager.getSettings();

      expect(settings).toEqual(storedSettings);
    });
  });

  describe("setSettings", () => {
    it("should save settings to local storage", async () => {
      const newSettings: ExtensionSettings = {
        autoGenerate: true,
        reportFormat: "html",
        maxReportLength: 1500,
      };
      mockChrome.storage.local.set.mockResolvedValue(undefined);

      await storageManager.setSettings(newSettings);

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        settings: newSettings,
      });
    });
  });

  describe("getUserPreferences", () => {
    it("should return default preferences when none exist", async () => {
      mockChrome.storage.sync.get.mockResolvedValue({});

      const preferences = await storageManager.getUserPreferences();

      expect(preferences).toEqual({
        theme: "auto",
        language: "en",
      });
    });

    it("should return stored preferences when they exist", async () => {
      const storedPreferences: UserPreferences = {
        theme: "dark",
        language: "ko",
      };
      mockChrome.storage.sync.get.mockResolvedValue({
        userPreferences: storedPreferences,
      });

      const preferences = await storageManager.getUserPreferences();

      expect(preferences).toEqual(storedPreferences);
    });
  });

  describe("setUserPreferences", () => {
    it("should save preferences to sync storage", async () => {
      const newPreferences: UserPreferences = {
        theme: "light",
        language: "ko",
      };
      mockChrome.storage.sync.set.mockResolvedValue(undefined);

      await storageManager.setUserPreferences(newPreferences);

      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({
        userPreferences: newPreferences,
      });
    });
  });
});
