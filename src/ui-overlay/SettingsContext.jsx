// src/contexts/SettingsContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();
const LOCAL_STORAGE_KEY = 'settings';

const defaultSettings = {
  visitedRooms: {},            // { [roomId]: true }
  hasFinishedTutorial: false,
  musicOn: true,
  playerPosition: [0, 0, 0], 
  currentRoomIndex: null, // ✅ NEW
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
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

  const updatePlayerPosition = (position) => {
    setSettings((prev) => ({
      ...prev,
      playerPosition: position,
    }));
  };

  const updateCurrentRoomIndex = (index) => {
  setSettings((prev) => ({
    ...prev,
    currentRoomIndex: index,
  }));
};

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  useEffect(() => {
  resetSettings(); // 🔥 wipe it all clean on first load (DEV ONLY)
}, []);


  return (
    <SettingsContext.Provider
      value={{
        settings,
        markRoomVisited,
        toggleMusic,
        setTutorialComplete,
        updatePlayerPosition,
        updateCurrentRoomIndex,
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
