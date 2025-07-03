import React, { useState } from "react";

import FeedbackTest from "./components/feedback-test";
import GeminiApiKeyInput from "./components/gemini-api-key-input";
import RefineContents from "./components/refine-contents";
import TestContents from "./components/test-contents";
import { useUseGeminiApiKey } from "./hooks/use-gemini-api-key";

export const Popup: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>("test");

  const { geminiApiKey, changeGeminiApiKey } = useUseGeminiApiKey();

  return (
    <div className="w-[500px] p-4 bg-background text-foreground max-h-[600px] overflow-y-auto">
      <h1 className="text-xl font-bold mb-4">Report Generator</h1>

      {/* gemini api key input */}
      <GeminiApiKeyInput apiKey={geminiApiKey} onChange={changeGeminiApiKey} />

      {/* tab */}
      <div className="flex justify-center mb-4">
        <button
          className={`mr-4 px-3 py-1 rounded ${
            selectedTab === "test" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSelectedTab("test")}
        >
          Test
        </button>
        <button
          className={`mr-4 px-3 py-1 rounded ${
            selectedTab === "refine" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSelectedTab("refine")}
        >
          Refine
        </button>
        <button
          className={`px-3 py-1 rounded ${
            selectedTab === "feedback"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedTab("feedback")}
        >
          Feedback
        </button>
      </div>

      {selectedTab === "test" && <TestContents geminiApiKey={geminiApiKey} />}

      {selectedTab === "refine" && (
        <RefineContents geminiApiKey={geminiApiKey} />
      )}

      {selectedTab === "feedback" && (
        <FeedbackTest geminiApiKey={geminiApiKey} />
      )}
    </div>
  );
};
