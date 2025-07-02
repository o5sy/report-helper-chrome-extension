import type { StorageResult, WorkItem } from "../types";

import { ApiOrchestrator } from "./api-orchestrator";
import { ErrorHandler } from "./error-handler";
import { StorageManager } from "./storage-manager";

export class ServiceWorkerManager {
  private storageManager: StorageManager;
  private apiOrchestrator: ApiOrchestrator;
  private errorHandler: ErrorHandler;
  private isInitialized = false;
  private keepAliveInterval?: ReturnType<typeof setInterval>;

  constructor() {
    this.storageManager = new StorageManager();
    this.apiOrchestrator = new ApiOrchestrator();
    this.errorHandler = new ErrorHandler();
  }

  initialize(): boolean {
    try {
      this.setupEventListeners();
      this.keepAlive();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize service worker:", error);
      return false;
    }
  }

  keepAlive(): void {
    // Keep service worker active
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }

    this.keepAliveInterval = setInterval(() => {
      // Simple ping to keep worker alive
      console.log("Service worker heartbeat:", new Date().toISOString());
    }, 25000); // Every 25 seconds
  }

  isActive(): boolean {
    return this.isInitialized;
  }

  async processQueue(): Promise<StorageResult> {
    try {
      const workQueue = await this.storageManager.getWorkQueue();
      const pendingItems = workQueue.filter(
        (item) => item.status === "pending"
      );

      for (const item of pendingItems) {
        await this.processWorkItem(item);
      }

      return { success: true };
    } catch (error) {
      return this.errorHandler.handleError(error, "UNKNOWN_ERROR");
    }
  }

  private async processWorkItem(item: WorkItem): Promise<void> {
    try {
      // Update status to processing
      await this.storageManager.updateWorkItem(item.id, {
        status: "processing",
        updatedAt: Date.now(),
      });

      let result: StorageResult;

      switch (item.type) {
        case "GENERATE_REPORT":
          result = await this.apiOrchestrator.processReportRequest({
            url: item.payload.url as string,
            content: item.payload.content as string,
            title: item.payload.title as string,
          });
          break;
        default:
          throw new Error(`Unknown work item type: ${item.type}`);
      }

      // Update status based on result
      if (result.success) {
        await this.storageManager.updateWorkItem(item.id, {
          status: "completed",
          updatedAt: Date.now(),
        });
      } else {
        const shouldRetry = this.errorHandler.shouldRetry(
          "API_ERROR",
          (item.retryCount || 0) + 1
        );

        if (shouldRetry) {
          await this.storageManager.updateWorkItem(item.id, {
            status: "pending",
            retryCount: (item.retryCount || 0) + 1,
            updatedAt: Date.now(),
          });
        } else {
          await this.storageManager.updateWorkItem(item.id, {
            status: "failed",
            error: result.error,
            updatedAt: Date.now(),
          });
        }
      }
    } catch (error) {
      await this.storageManager.updateWorkItem(item.id, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        updatedAt: Date.now(),
      });
    }
  }

  private setupEventListeners(): void {
    // Setup any additional event listeners if needed
    console.log("Service worker event listeners setup complete");
  }

  cleanup(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
    this.isInitialized = false;
  }
}
