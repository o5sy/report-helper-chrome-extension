import { beforeEach, describe, expect, it, vi } from "vitest";

import { StorageManager } from "./storage-manager";

describe("StorageManager", () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    storageManager = new StorageManager();
    vi.clearAllMocks();
  });

  describe("getSettings", () => {
    it("should return default settings when no settings exist", async () => {
      const settings = await storageManager.getSettings();

      expect(settings).toBeDefined();
      expect(settings.autoGenerate).toBe(true);
      expect(settings.reportFormat).toBe("markdown");
    });
  });

  describe("saveSettings", () => {
    it("should save settings successfully", async () => {
      const newSettings = {
        autoGenerate: false,
        reportFormat: "pdf" as const,
        maxReportLength: 1000,
      };

      const result = await storageManager.saveSettings(newSettings);
      expect(result.success).toBe(true);
    });
  });

  describe("getWorkQueue", () => {
    it("should return empty queue initially", async () => {
      const queue = await storageManager.getWorkQueue();
      expect(Array.isArray(queue)).toBe(true);
      expect(queue.length).toBe(0);
    });
  });

  describe("addToWorkQueue", () => {
    it("should add work item to queue", async () => {
      const workItem = {
        id: "test-1",
        type: "GENERATE_REPORT" as const,
        payload: { url: "https://example.com" },
        status: "pending" as const,
        createdAt: Date.now(),
      };

      const result = await storageManager.addToWorkQueue(workItem);
      expect(result.success).toBe(true);
    });
  });
});
