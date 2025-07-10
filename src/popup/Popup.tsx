import React, { useEffect, useState } from "react";
import { useUseGeminiApiKey, useUseSpreadSheetId } from "./hooks";

import FeedbackTest from "./components/feedback-test";
import GeminiApiKeyInput from "./components/gemini-api-key-input";
import RefineContents from "./components/refine-contents";
import SheetIdInput from "./components/sheet-id-input";

export const Popup: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>("feedback");

  const { geminiApiKey, changeGeminiApiKey } = useUseGeminiApiKey();
  const { spreadsheetId, onChangeSpreadsheetId } = useUseSpreadSheetId();

  // Load saved tab from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem("selectedTab");
    if (savedTab) {
      setSelectedTab(savedTab);
    }
  }, []);

  // Save tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("selectedTab", selectedTab);
  }, [selectedTab]);

  return (
    <div className="w-[500px] p-4 bg-background text-foreground max-h-[600px] overflow-y-auto">
      <h1 className="text-xl font-bold mb-4">Report Generator</h1>

      {/* gemini api key input */}
      <GeminiApiKeyInput apiKey={geminiApiKey} onChange={changeGeminiApiKey} />

      {/* sheet id input */}
      <SheetIdInput
        spreadsheetId={spreadsheetId}
        onChange={onChangeSpreadsheetId}
      />

      {/* tab */}
      <div className="flex justify-center my-4">
        {/* <button
          className={`mr-4 px-3 py-1 rounded ${
            selectedTab === "test" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSelectedTab("test")}
        >
          Test
        </button> */}
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

      <div className="border-t pt-4">
        {/* {selectedTab === "test" && <TestContents geminiApiKey={geminiApiKey} />} */}

        {selectedTab === "refine" && (
          <RefineContents
            geminiApiKey={geminiApiKey}
            spreadsheetId={spreadsheetId}
          />
        )}
        {selectedTab === "feedback" && (
          <FeedbackTest
            geminiApiKey={geminiApiKey}
            spreadsheetId={spreadsheetId}
          />
        )}
      </div>
    </div>
  );
};
