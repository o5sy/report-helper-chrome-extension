import { beforeEach, describe, expect, it, vi } from "vitest";

import { GoogleAuthService } from "../";

// Mock Chrome Identity API
const mockChrome = {
  identity: {
    getAuthToken: vi.fn(),
    removeCachedAuthToken: vi.fn(),
    launchWebAuthFlow: vi.fn(),
  },
  runtime: {
    lastError: null as { message: string } | null,
  },
};

// @ts-expect-error - Mocking global chrome for testing
(globalThis as any).chrome = mockChrome;

describe("GoogleAuthService", () => {
  let authService: GoogleAuthService;

  beforeEach(() => {
    authService = new GoogleAuthService();
    vi.clearAllMocks();
    mockChrome.runtime.lastError = null;
  });

  describe("getAccessToken", () => {
    it("should return access token when authentication succeeds", async () => {
      const mockToken = "mock-access-token";
      mockChrome.identity.getAuthToken.mockResolvedValue(mockToken);

      const result = await authService.getAccessToken();

      expect(result.success).toBe(true);
      expect(result.token).toBe(mockToken);
      expect(mockChrome.identity.getAuthToken).toHaveBeenCalledWith({
        interactive: true,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
    });

    it("should return error when authentication fails", async () => {
      mockChrome.identity.getAuthToken.mockRejectedValue(
        new Error("Auth failed")
      );

      const result = await authService.getAccessToken();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentication failed: Auth failed");
    });

    it("should handle Chrome runtime error", async () => {
      mockChrome.runtime.lastError = { message: "Runtime error" };
      mockChrome.identity.getAuthToken.mockResolvedValue(null);

      const result = await authService.getAccessToken();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Chrome runtime error: Runtime error");
    });
  });

  describe("revokeToken", () => {
    it("should successfully revoke cached token", async () => {
      const mockToken = "mock-token-to-revoke";
      mockChrome.identity.removeCachedAuthToken.mockResolvedValue(undefined);

      const result = await authService.revokeToken(mockToken);

      expect(result.success).toBe(true);
      expect(mockChrome.identity.removeCachedAuthToken).toHaveBeenCalledWith({
        token: mockToken,
      });
    });

    it("should handle revocation error", async () => {
      const mockToken = "mock-token";
      mockChrome.identity.removeCachedAuthToken.mockRejectedValue(
        new Error("Revoke failed")
      );

      const result = await authService.revokeToken(mockToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Token revocation failed: Revoke failed");
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when valid token exists", async () => {
      mockChrome.identity.getAuthToken.mockResolvedValue("valid-token");

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
      expect(mockChrome.identity.getAuthToken).toHaveBeenCalledWith({
        interactive: false,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
    });

    it("should return false when no token available", async () => {
      mockChrome.identity.getAuthToken.mockResolvedValue(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it("should return false when authentication check fails", async () => {
      mockChrome.identity.getAuthToken.mockRejectedValue(
        new Error("Check failed")
      );

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});
