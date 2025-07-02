import { beforeEach, describe, expect, it, vi } from "vitest";

import { ServiceWorkerManager } from "./service-worker-manager";

describe("ServiceWorkerManager", () => {
  let serviceWorkerManager: ServiceWorkerManager;

  beforeEach(() => {
    serviceWorkerManager = new ServiceWorkerManager();
    vi.clearAllMocks();
  });

  describe("initialize", () => {
    it("should initialize service worker successfully", () => {
      const result = serviceWorkerManager.initialize();
      expect(result).toBe(true);
    });
  });

  describe("keepAlive", () => {
    it("should keep service worker alive", () => {
      serviceWorkerManager.keepAlive();
      expect(serviceWorkerManager.isActive()).toBe(true);
    });
  });

  describe("processQueue", () => {
    it("should process work queue", async () => {
      const result = await serviceWorkerManager.processQueue();
      expect(result.success).toBe(true);
    });
  });
});
