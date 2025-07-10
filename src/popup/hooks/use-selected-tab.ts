import { useEffect, useState } from "react";

export const useUseSelectedTab = () => {
  const [selectedTab, setSelectedTab] = useState<string>("feedback");

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
