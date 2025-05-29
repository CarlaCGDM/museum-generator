// src/contexts/SettingsContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();
const LOCAL_STORAGE_KEY = 'settings';

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          visitedRooms: {}, // { [roomId]: true }
          hasFinishedTutorial: false,
          musicOn: true,
        };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const markRoomVisited = (roomId) => {
    setSettings((prev) => ({
      ...prev,
      visitedRooms: {
        ...prev.visitedRooms,
        [roomId]: true,
      },
    }));
  };

  const toggleMusic = (on) => {
    setSettings((prev) => ({
      ...prev,
      musicOn: on,
    }));
  };

  const setTutorialComplete = (isComplete) => {
    setSettings((prev) => ({
      ...prev,
      hasFinishedTutorial: isComplete,
    }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      visitedRooms: {},
      hasFinishedTutorial: false,
      musicOn: true,
    };
    setSettings(defaultSettings);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        markRoomVisited,
        toggleMusic,
        setTutorialComplete,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
