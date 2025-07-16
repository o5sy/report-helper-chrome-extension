/// <reference types="chrome"/>

import { AuthResult } from "./types";

export class GoogleAuthService {
  private readonly scopes = ["https://www.googleapis.com/auth/spreadsheets"];

  async getAccessToken(): Promise<AuthResult> {
    try {
      const token = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken(
          {
            interactive: true,
            scopes: this.scopes,
          },
          (token) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (token) {
              resolve(token);
            } else {
              reject(new Error("No token received"));
            }
          }
        );
      });

      return {
        success: true,
        token,
      };
    } catch (error) {
      return {
        success: false,
        error: `Authentication failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async revokeToken(token: string): Promise<AuthResult> {
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Token revocation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await new Promise<string | undefined>((resolve) => {
        chrome.identity.getAuthToken(
          {
            interactive: false,
            scopes: this.scopes,
          },
          (token) => {
            resolve(token);
          }
        );
      });
      return !!token;
    } catch {
      return false;
    }
  }
}
