import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock chrome API
const mockChrome = {
  runtime: {
    onInstalled: {
      addListener: vi.fn(),
    },
    onMessage: {
      addListener: vi.fn(),
    },
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
    },
  },
  storage: {
    local: {
      set: vi.fn(),
      get: vi.fn(),
    },
  },
};

Object.defineProperty(globalThis, "chrome", {
  value: mockChrome,
  writable: true,
});

describe("Background Service Worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register onInstalled listener", async () => {
    await import("./index");

    expect(mockChrome.runtime.onInstalled.addListener).toHaveBeenCalled();
  });

  it("should register onMessage listener", async () => {
    await import("./index");

    expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalled();
  });

  it("should register action onClicked listener", async () => {
    await import("./index");

    expect(mockChrome.action.onClicked.addListener).toHaveBeenCalled();
  });
});
