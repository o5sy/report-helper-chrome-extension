/// <reference types="chrome"/>
import type { ExtensionSettings, StorageResult, WorkItem } from "../types";

export class StorageManager {
  private readonly STORAGE_KEYS = {
    SETTINGS: "extension_settings",
    WORK_QUEUE: "work_queue",
    USER_AUTH: "user_auth",
  };

  async getSettings(): Promise<ExtensionSettings> {
    try {
      const result = await chrome.storage.sync.get(this.STORAGE_KEYS.SETTINGS);
      return result[this.STORAGE_KEYS.SETTINGS] || this.getDefaultSettings();
    } catch (error) {
      console.error("Failed to get settings:", error);
      return this.getDefaultSettings();
    }
  }

  async saveSettings(settings: ExtensionSettings): Promise<StorageResult> {
    try {
      await chrome.storage.sync.set({
        [this.STORAGE_KEYS.SETTINGS]: settings,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to save settings",
      };
    }
  }

  async getWorkQueue(): Promise<WorkItem[]> {
    try {
      const result = await chrome.storage.local.get(
        this.STORAGE_KEYS.WORK_QUEUE
      );
      return result[this.STORAGE_KEYS.WORK_QUEUE] || [];
    } catch (error) {
      console.error("Failed to get work queue:", error);
      return [];
    }
  }

  async addToWorkQueue(workItem: WorkItem): Promise<StorageResult> {
    try {
      const currentQueue = await this.getWorkQueue();
      currentQueue.push(workItem);

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.WORK_QUEUE]: currentQueue,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to add to work queue",
      };
    }
  }

  async updateWorkItem(
    id: string,
    updates: Partial<WorkItem>
  ): Promise<StorageResult> {
    try {
      const currentQueue = await this.getWorkQueue();
      const itemIndex = currentQueue.findIndex((item) => item.id === id);

      if (itemIndex === -1) {
        return { success: false, error: "Work item not found" };
      }

      currentQueue[itemIndex] = {
        ...currentQueue[itemIndex],
        ...updates,
        updatedAt: Date.now(),
      };

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.WORK_QUEUE]: currentQueue,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update work item",
      };
    }
  }

  async clearCompletedWork(): Promise<StorageResult> {
    try {
      const currentQueue = await this.getWorkQueue();
      const activeQueue = currentQueue.filter(
        (item) => item.status !== "completed" && item.status !== "failed"
      );

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.WORK_QUEUE]: activeQueue,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to clear completed work",
      };
    }
  }

  private getDefaultSettings(): ExtensionSettings {
    return {
      autoGenerate: true,
      reportFormat: "markdown",
      maxReportLength: 5000,
    };
  }
}
