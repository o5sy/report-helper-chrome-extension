export type ErrorType =
  | "API_ERROR"
  | "NETWORK_ERROR"
  | "STORAGE_ERROR"
  | "VALIDATION_ERROR"
  | "UNKNOWN_ERROR";

export interface ErrorResult {
  success: false;
  error: string;
  errorType: ErrorType;
  retryable?: boolean;
}

export class ErrorHandler {
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRYABLE_ERRORS: ErrorType[] = [
    "NETWORK_ERROR",
    "API_ERROR",
  ];

  handleError(error: unknown, errorType?: ErrorType): ErrorResult {
    let errorMessage: string;
    let finalErrorType: ErrorType;

    if (error instanceof Error) {
      errorMessage = error.message;
      finalErrorType = errorType || this.categorizeError(error);
    } else if (typeof error === "string") {
      errorMessage = error;
      finalErrorType = errorType || "UNKNOWN_ERROR";
    } else {
      errorMessage = "Unknown error occurred";
      finalErrorType = "UNKNOWN_ERROR";
    }

    return {
      success: false,
      error: errorMessage,
      errorType: finalErrorType,
      retryable: this.RETRYABLE_ERRORS.includes(finalErrorType),
    };
  }

  shouldRetry(errorType: ErrorType, currentAttempt: number): boolean {
    return (
      this.RETRYABLE_ERRORS.includes(errorType) &&
      currentAttempt < this.MAX_RETRY_ATTEMPTS
    );
  }

  getUserFriendlyMessage(errorType: ErrorType): string {
    switch (errorType) {
      case "API_ERROR":
        return "서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
      case "NETWORK_ERROR":
        return "네트워크 연결을 확인하고 다시 시도해주세요.";
      case "STORAGE_ERROR":
        return "데이터 저장 중 문제가 발생했습니다.";
      case "VALIDATION_ERROR":
        return "입력된 정보를 확인해주세요.";
      default:
        return "알 수 없는 오류가 발생했습니다.";
    }
  }

  private categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("fetch")) {
      return "NETWORK_ERROR";
    }
    if (message.includes("api") || message.includes("server")) {
      return "API_ERROR";
    }
    if (message.includes("storage") || message.includes("quota")) {
      return "STORAGE_ERROR";
    }
    if (message.includes("validation") || message.includes("invalid")) {
      return "VALIDATION_ERROR";
    }

    return "UNKNOWN_ERROR";
  }
}
