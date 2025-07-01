import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { Popup } from "./Popup";
import React from "react";

// Chrome API 모킹
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  identity: {},
  runtime: {},
};

// 전역 window.chrome 모킹
Object.defineProperty(window, "chrome", {
  value: mockChrome,
  writable: true,
});

// Gemini Client 모킹
vi.mock("../services/gemini-client", () => ({
  GeminiClient: vi.fn().mockImplementation(() => ({
    processText: vi.fn(),
  })),
}));

// Google Auth Service 모킹
vi.mock("../services/google-auth", () => ({
  GoogleAuthService: vi.fn(),
}));

// Google Sheets Service 모킹
vi.mock("../services/google-sheets", () => ({
  GoogleSheetsService: vi.fn(),
}));

describe("Popup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChrome.storage.local.get.mockResolvedValue({});
    mockChrome.storage.local.set.mockResolvedValue(undefined);
  });

  it("should render popup with all sections", () => {
    render(<Popup />);

    expect(screen.getByText("Report Generator")).toBeInTheDocument();
    expect(screen.getByText("Chrome API 상태:")).toBeInTheDocument();
    expect(
      screen.getByText("Google Sheets API 테스트 결과:")
    ).toBeInTheDocument();
    expect(screen.getByText("Gemini API 설정:")).toBeInTheDocument();
    expect(screen.getByText("Gemini API 테스트 결과:")).toBeInTheDocument();
  });

  it("should render Gemini API test button", () => {
    render(<Popup />);

    const geminiTestButton = screen.getByText("Gemini API 테스트");
    expect(geminiTestButton).toBeInTheDocument();
    expect(geminiTestButton).toBeDisabled(); // API 키가 없으면 비활성화
  });

  it("should enable Gemini test button when API key is entered", async () => {
    render(<Popup />);

    const apiKeyInput = screen.getByPlaceholderText(
      "Gemini API 키를 입력하세요"
    );
    const testButton = screen.getByText("Gemini API 테스트");

    expect(testButton).toBeDisabled();

    fireEvent.change(apiKeyInput, { target: { value: "test-api-key" } });

    await waitFor(() => {
      expect(testButton).not.toBeDisabled();
    });
  });

  it("should save API key to storage when entered", async () => {
    render(<Popup />);

    const apiKeyInput = screen.getByPlaceholderText(
      "Gemini API 키를 입력하세요"
    );

    fireEvent.change(apiKeyInput, { target: { value: "test-api-key" } });

    await waitFor(() => {
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        geminiApiKey: "test-api-key",
      });
    });
  });

  it("should load saved API key on mount", async () => {
    const savedApiKey = "saved-test-key";
    mockChrome.storage.local.get.mockResolvedValue({
      geminiApiKey: savedApiKey,
    });

    render(<Popup />);

    await waitFor(() => {
      const apiKeyInput = screen.getByPlaceholderText(
        "Gemini API 키를 입력하세요"
      ) as HTMLInputElement;
      expect(apiKeyInput.value).toBe(savedApiKey);
    });
  });

  it("should show button disabled when no API key", () => {
    render(<Popup />);

    const testButton = screen.getByText("Gemini API 테스트");

    // API 키가 없을 때 버튼이 비활성화되어 있는지 확인
    expect(testButton).toBeDisabled();
  });

  it("should display Chrome API information", () => {
    render(<Popup />);

    const chromeInfo = screen.getByText(/chrome.*identity.*runtime/i);
    expect(chromeInfo).toBeInTheDocument();
  });

  it("should render Google Sheets test button", () => {
    render(<Popup />);

    const sheetsTestButton = screen.getByText("Google Sheets API 테스트");
    expect(sheetsTestButton).toBeInTheDocument();
    expect(sheetsTestButton).not.toBeDisabled();
  });
});
