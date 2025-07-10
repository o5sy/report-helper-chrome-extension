import { useEffect, useState } from "react";

import { getCurrentSpreadsheetId } from "@/utils/storage";

export const useUseSpreadSheetId = () => {
  const [spreadsheetId, setSpreadsheetId] = useState<string>("");

  // Auto-detect spreadsheet ID from current tab
  useEffect(() => {
    const detectSpreadsheetId = async () => {
      try {
        const currentId = await getCurrentSpreadsheetId();
        if (currentId) {
          setSpreadsheetId(currentId);
        }
      } catch (error) {
        console.error("Failed to detect spreadsheet ID:", error);
      }
    };

    detectSpreadsheetId();
  }, []);

  return { spreadsheetId, onChangeSpreadsheetId: setSpreadsheetId };
};
