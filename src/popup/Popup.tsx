import { TAB_ITEMS, TabItem } from "./types";
import {
  useUseGeminiApiKey,
  useUseSelectedTab,
  useUseSpreadSheetId,
} from "./hooks";

import FeedbackTest from "./components/feedback-test";
import GeminiApiKeyInput from "./components/gemini-api-key-input";
import RefineContents from "./components/refine-contents";
import SheetIdReadonlyInput from "./components/sheet-id-readonly-input";

export function Popup() {
  const { selectedTab, onChangeSelectedTab } = useUseSelectedTab();

  const { geminiApiKey, changeGeminiApiKey } = useUseGeminiApiKey();
  const { spreadsheetId } = useUseSpreadSheetId();

  return (
    <div className="w-[500px] p-4 bg-background text-foreground max-h-[600px] overflow-y-auto">
      <h1 className="text-xl font-bold mb-4">Report Generator</h1>

      {/* gemini api key input */}
      <GeminiApiKeyInput apiKey={geminiApiKey} onChange={changeGeminiApiKey} />

      {/* sheet id input */}
      <SheetIdReadonlyInput spreadsheetId={spreadsheetId} />

      {/* tab */}
      <div className="flex justify-center my-4">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.value}
            className={`mr-4 px-3 py-1 rounded ${
              selectedTab === tab.value
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => onChangeSelectedTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* tab content */}
      <div className="border-t pt-4">
        {selectedTab === TabItem.REFINE && (
          <RefineContents
            geminiApiKey={geminiApiKey}
            spreadsheetId={spreadsheetId}
          />
        )}
        {selectedTab === TabItem.FEEDBACK && (
          <FeedbackTest
            geminiApiKey={geminiApiKey}
            spreadsheetId={spreadsheetId}
          />
        )}
      </div>
    </div>
  );
}
