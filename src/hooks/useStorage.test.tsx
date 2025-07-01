import { StorageProvider, useStorage } from "./useStorage";
import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import React from "react";

// 간단한 모킹
vi.mock("../utils/storage", () => ({
  StorageManager: vi.fn().mockImplementation(() => ({
    getSettings: vi.fn().mockResolvedValue({
      autoGenerate: false,
      reportFormat: "markdown",
      maxReportLength: 1000,
    }),
    setSettings: vi.fn().mockResolvedValue(undefined),
    getUserPreferences: vi.fn().mockResolvedValue({
      theme: "auto",
      language: "en",
    }),
    setUserPreferences: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe("useStorage", () => {
  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useStorage());
    }).toThrow("useStorage must be used within a StorageProvider");
  });

  it("should provide storage context when used within provider", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <StorageProvider>{children}</StorageProvider>
    );

    const { result } = renderHook(() => useStorage(), { wrapper });

    // 초기 상태 확인
    expect(result.current.isLoading).toBe(true);
    expect(typeof result.current.updateSettings).toBe("function");
    expect(typeof result.current.updatePreferences).toBe("function");

    // 로딩 완료 대기
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 데이터 로드 확인
    expect(result.current.settings).toEqual({
      autoGenerate: false,
      reportFormat: "markdown",
      maxReportLength: 1000,
    });

    expect(result.current.preferences).toEqual({
      theme: "auto",
      language: "en",
    });
  });
});
