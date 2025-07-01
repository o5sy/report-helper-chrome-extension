import "@testing-library/jest-dom";

import { vi } from "vitest";

// Mock chrome API for tests
Object.defineProperty(globalThis, "chrome", {
  value: {
    runtime: {
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      sendMessage: vi.fn(),
      getURL: vi.fn(),
    },
    action: {
      onClicked: {
        addListener: vi.fn(),
      },
    },
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
      },
    },
    scripting: {
      executeScript: vi.fn(),
    },
  },
  writable: true,
});
