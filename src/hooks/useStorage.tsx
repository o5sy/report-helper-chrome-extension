import { ExtensionSettings, UserPreferences } from "../types";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { StorageManager } from "../utils/storage";

interface StorageContextType {
  settings: ExtensionSettings;
  preferences: UserPreferences;
  isLoading: boolean;
  updateSettings: (newSettings: ExtensionSettings) => Promise<void>;
  updatePreferences: (newPreferences: UserPreferences) => Promise<void>;
}

const defaultSettings: ExtensionSettings = {
  autoGenerate: false,
  reportFormat: "markdown",
  maxReportLength: 1000,
};

const defaultPreferences: UserPreferences = {
  theme: "auto",
  language: "en",
};

const StorageContext = createContext<StorageContextType | null>(null);

interface StorageProviderProps {
  children: ReactNode;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings);
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [storageManager] = useState(() => new StorageManager());

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [loadedSettings, loadedPreferences] = await Promise.all([
          storageManager.getSettings(),
          storageManager.getUserPreferences(),
        ]);

        setSettings(loadedSettings);
        setPreferences(loadedPreferences);
      } catch (error) {
        console.error("Failed to load initial storage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [storageManager]);

  const updateSettings = async (
    newSettings: ExtensionSettings
  ): Promise<void> => {
    try {
      await storageManager.setSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  };

  const updatePreferences = async (
    newPreferences: UserPreferences
  ): Promise<void> => {
    try {
      await storageManager.setUserPreferences(newPreferences);
      setPreferences(newPreferences);
    } catch (error) {
      console.error("Failed to update preferences:", error);
      throw error;
    }
  };

  const value: StorageContextType = {
    settings,
    preferences,
    isLoading,
    updateSettings,
    updatePreferences,
  };

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
};

export const useStorage = (): StorageContextType => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};
