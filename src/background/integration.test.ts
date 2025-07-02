/// <reference types="chrome"/>
import { beforeEach, describe, expect, it } from "vitest";

import { ApiOrchestrator } from "./api-orchestrator";
import { ErrorHandler } from "./error-handler";
import { MessageHandler } from "./message-handler";
import { ServiceWorkerManager } from "./service-worker-manager";
import { StorageManager } from "./storage-manager";

describe("Background Service Worker Integration", () => {
  let messageHandler: MessageHandler;
  let storageManager: StorageManager;
  let apiOrchestrator: ApiOrchestrator;
  let errorHandler: ErrorHandler;
  let serviceWorkerManager: ServiceWorkerManager;

  beforeEach(() => {
    messageHandler = new MessageHandler();
    storageManager = new StorageManager();
    apiOrchestrator = new ApiOrchestrator();
    errorHandler = new ErrorHandler();
    serviceWorkerManager = new ServiceWorkerManager();
  });

  describe("System Integration", () => {
    it("should create all components successfully", () => {
      expect(messageHandler).toBeDefined();
      expect(storageManager).toBeDefined();
      expect(apiOrchestrator).toBeDefined();
      expect(errorHandler).toBeDefined();
      expect(serviceWorkerManager).toBeDefined();
    });

    it("should handle basic report generation workflow", async () => {
      const reportRequest = {
        url: "https://example.com",
        content: "Test content for processing",
      };

      const result = await apiOrchestrator.processReportRequest(reportRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should handle error scenarios gracefully", () => {
      const error = new Error("Test error");
      const result = errorHandler.handleError(error, "API_ERROR");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("API_ERROR");
      expect(result.retryable).toBe(true);
    });

    it("should initialize service worker manager", () => {
      const initialized = serviceWorkerManager.initialize();
      expect(initialized).toBe(true);
      expect(serviceWorkerManager.isActive()).toBe(true);
    });
  });

  describe("Message Flow", () => {
    it("should process GENERATE_REPORT message end-to-end", async () => {
      const message = {
        type: "GENERATE_REPORT" as const,
        payload: {
          url: "https://example.com",
          title: "Test Page",
        },
      };

      const response = await messageHandler.handleMessage(message);

      expect(response.success).toBe(true);
      expect(response.type).toBe("GENERATE_REPORT_RESPONSE");
    });

    it("should process GET_SETTINGS message", async () => {
      const message = {
        type: "GET_SETTINGS" as const,
        payload: {},
      };

      const response = await messageHandler.handleMessage(message);

      expect(response.success).toBe(true);
      expect(response.type).toBe("GET_SETTINGS_RESPONSE");
    });
  });
});
