import { TAB_ITEMS, TabItem } from './types';
import {
  useUseGeminiApiKey,
  useUseSelectedTab,
  useUseSpreadSheetId,
} from './hooks';

import FeedbackTest from './components/feedback-test';
import GeminiApiKeyInput from './components/gemini-api-key-input';
import RefineContents from './components/refine-contents';
import SheetIdReadonlyInput from './components/sheet-id-readonly-input';

export function Popup() {
  const { selectedTab, onChangeSelectedTab } = useUseSelectedTab();

  const { geminiApiKey, updateGeminiApiKey } = useUseGeminiApiKey();
  const { spreadsheetId } = useUseSpreadSheetId();

  return (
    <div className="min-h-[600px] min-w-[350px] overflow-y-auto bg-background p-4 text-foreground">
      <h1 className="mb-4 text-xl font-bold">Report Helper Tools 🛠️</h1>

      {/* gemini api key input */}
      <GeminiApiKeyInput apiKey={geminiApiKey} onChange={updateGeminiApiKey} />

      {/* sheet id input */}
      <SheetIdReadonlyInput spreadsheetId={spreadsheetId} />

      {/* tab container */}
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {/* tab */}
        <div className="flex border-b border-gray-200">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.value}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                selectedTab === tab.value
                  ? 'border-b border-primary bg-[#46aa32]/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => onChangeSelectedTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* tab content */}
        <div className="p-4">
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
    </div>
  );
}
