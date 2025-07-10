import { useEffect, useState } from "react";

import { TabItem } from "../types";

export const useUseSelectedTab = () => {
  const [selectedTab, setSelectedTab] = useState<TabItem>(TabItem.REFINE);

  useEffect(() => {
    const loadSavedTab = async () => {
      const savedTab = await window.chrome.storage.local.get("selectedTab");
      if (savedTab) {
        setSelectedTab(savedTab.selectedTab);
      }
    };

    loadSavedTab();
  }, []);

  useEffect(() => {
    const saveTab = async () => {
      await window.chrome.storage.local.set({ selectedTab });
    };

    saveTab();
  }, [selectedTab]);

  return { selectedTab, onChangeSelectedTab: setSelectedTab };
};
