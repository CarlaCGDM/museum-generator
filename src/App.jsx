import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import MuseumLayout from './museum-layout/components/MuseumLayout';
import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { useDebug } from './debug/DebugContext';
import { computeRoomSizes } from './museum-layout/utils/computeRoomSizes';
import { createLogger } from './debug/utils/logger';
import DevOverlay from './ui-overlay/DevOverlay';
import { ModelSettingsContext } from './ui-overlay/model-selector/ModelSettingsContext';
import { generateRandomMuseumData } from './museum-layout/utils/generateRandomMuseumData';
import CameraManager from './first-person-movement/CameraManager';
import { SceneWithRoomEnvironment } from './lighting/SceneWithRoomEnvironment';
import FirstPersonMovementController from './first-person-movement/FirstPersonMovementController';
import { SettingsProvider, useSettings } from './ui-overlay/SettingsContext';
import PlayerTracker from './first-person-movement/PlayerTracker';
import UIOverlay from './ui-overlay/UIOverlay';

function RoomLogger({ roomData }) {
  const { settings } = useSettings();

  useEffect(() => {
    if (!roomData || roomData.length === 0) return;

    const table = roomData.map((room) => ({
      Room: room.name,
      Visited: !!settings.visitedRooms?.[room.id],
    }));

    console.table(table);
  }, [roomData]);

  return null;
}

function AppContent() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const toggleOverlay = () => setOverlayVisible((prev) => !prev);

  const [customModels, setCustomModels] = useState({});
  const handleModelChange = (type, url) => {
    setCustomModels((prev) => ({ ...prev, [type]: url }));
  };

  const [cameraMode, setCameraMode] = useState('firstperson');

  const [roomData, setRoomData] = useState([]);
  const [roomPositions, setRoomPositions] = useState([]);
  const [layoutTrigger, setLayoutTrigger] = useState(0);
  const logComputeRoomSizes = useDebug('Layout', 'computeRoomSizes');

  const generateLayout = useCallback(async () => {
    try {
      const logger = createLogger(logComputeRoomSizes, 'computeRoomSizes');
      setRoomData([]);

      const dynamicMuseumData = generateRandomMuseumData(100);
      const report = await computeRoomSizes(dynamicMuseumData, logger);

      setRoomData(report);
    } catch (error) {
      console.error('Layout generation failed:', error);
    }
  }, [logComputeRoomSizes]);

  useEffect(() => {
    generateLayout();
  }, [generateLayout, layoutTrigger]);

  const regenerateMuseum = useCallback(() => {
    setLayoutTrigger((prev) => prev + 1);
  }, []);

  return (
    <ModelSettingsContext.Provider value={{ customModels, handleModelChange }}>
      <div className="app-container">
        <div
          className="canvas-container"
          style={{ width: overlayVisible ? '60vw' : '100vw' }}
        >
          <Canvas>
            <Stats />
            <PlayerTracker roomPositions={roomPositions} roomData={roomData} />
            <CameraManager cameraMode={cameraMode} />
            {cameraMode === 'orbit' && <OrbitControls />}
            {cameraMode === 'firstperson' && (
              <FirstPersonMovementController cameraMode={cameraMode} />
            )}

            <SceneWithRoomEnvironment />

            {roomData.length > 0 && (
              <>
                <MuseumLayout
                  key={layoutTrigger}
                  roomData={roomData}
                  setRoomPositions={setRoomPositions}
                />
                <RoomLogger roomData={roomData} />
              </>
            )}
          </Canvas>

          <button
            className="toggle-overlay-button ui-blocker"
            onClick={toggleOverlay}
          >
            {overlayVisible ? 'Hide dev UI' : 'Show dev UI'}
          </button>
        </div>

        <UIOverlay
          roomData={roomData}
        />

        {overlayVisible && (
          <DevOverlay
            onRegenerate={regenerateMuseum}
            cameraMode={cameraMode}
            setCameraMode={setCameraMode}
          />
        )}
      </div>
    </ModelSettingsContext.Provider>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
