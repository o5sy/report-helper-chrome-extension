import { beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorHandler } from "./error-handler";

describe("ErrorHandler", () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
    vi.clearAllMocks();
  });

  describe("handleError", () => {
    it("should handle API errors", () => {
      const error = new Error("API call failed");
      const result = errorHandler.handleError(error, "API_ERROR");

      expect(result.success).toBe(false);
      expect(result.error).toBe("API call failed");
      expect(result.errorType).toBe("API_ERROR");
    });

    it("should handle unknown errors", () => {
      const error = "Unknown error string";
      const result = errorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error occurred");
    });
  });

  describe("shouldRetry", () => {
    it("should allow retry for network errors", () => {
      const shouldRetry = errorHandler.shouldRetry("NETWORK_ERROR", 1);
      expect(shouldRetry).toBe(true);
    });

    it("should not retry after max attempts", () => {
      const shouldRetry = errorHandler.shouldRetry("NETWORK_ERROR", 3);
      expect(shouldRetry).toBe(false);
    });
  });
});
