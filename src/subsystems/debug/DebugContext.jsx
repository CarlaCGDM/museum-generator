// src/contexts/DebugContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const DebugContext = createContext();
const LOCAL_STORAGE_KEY = 'debugConfig';

export function DebugProvider({ children }) {
  const [debugConfig, setDebugConfig] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
        Layout: {
          enabled: false,
          computeRoomSizes: false,
          generateRoomLayout: false,
        },
        Room: {
          enabled: false,
          Indexes: false,
          Directions: false,
        },
        Tile: {
          enabled: false,
          Indexes: false,
        },
      };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(debugConfig));
  }, [debugConfig]);

  const toggleDebug = (category, key, value) => {
    setDebugConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  return (
    <DebugContext.Provider value={{ debugConfig, toggleDebug }}>
      {children}
    </DebugContext.Provider>
  );
}

// src/contexts/DebugContext.jsx
export function useDebug(category, key) {
  const { debugConfig, toggleDebug } = useContext(DebugContext);

  if (category && key !== undefined) {
    return debugConfig[category]?.enabled && debugConfig[category]?.[key];
  }

  return { debugConfig, toggleDebug };
}
