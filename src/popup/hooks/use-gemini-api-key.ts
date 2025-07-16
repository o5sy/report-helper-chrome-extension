import { useEffect, useState } from "react";

export const useUseGeminiApiKey = () => {
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");

  useEffect(() => {
    // 저장된 Gemini API 키 불러오기
    const loadGeminiApiKey = async () => {
      try {
        if (window.chrome?.storage?.local) {
          const result = await window.chrome.storage.local.get([
            "geminiApiKey",
          ]);
          if (result.geminiApiKey) {
            setGeminiApiKey(result.geminiApiKey);
          }
        }
      } catch (error) {
        console.log("API 키 로드 실패:", error);
      }
    };

    loadGeminiApiKey();
  }, []);

  const updateGeminiApiKey = async (value: string) => {
    setGeminiApiKey(value);

    try {
      if (window.chrome?.storage?.local) {
        await window.chrome.storage.local.set({ geminiApiKey: value });
      }
    } catch (error) {
      console.log("API 키 저장 실패:", error);
    }
  };

  return { geminiApiKey, updateGeminiApiKey };
};
