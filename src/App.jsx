import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import MuseumLayout from './subsystems/museum-layout/components/MuseumLayout';
import './App.css';
import { useState, useEffect, useCallback } from 'react';

import { createLogger } from './subsystems/debug/utils/logger';
import { useDebug } from './subsystems/debug/DebugContext';

import { generateRandomMuseumData } from './subsystems/museum-layout/utils/generateRandomMuseumData';
import { computeRoomSizes } from './subsystems/museum-layout/utils/computeRoomSizes';

import { SceneWithRoomEnvironment } from './subsystems/lighting/SceneWithRoomEnvironment';

import CameraManager from './subsystems/first-person-movement/components/CameraManager';
import FirstPersonMovementController from './subsystems/first-person-movement/components/FirstPersonMovementController';
import PlayerTracker from './subsystems/first-person-movement/components/PlayerTracker';

import { SettingsProvider, useSettings } from './subsystems/ui-overlay/SettingsContext';
import UIOverlay from './subsystems/ui-overlay/UIOverlay';
import { ModelSettingsContext } from './subsystems/ui-overlay/model-selector/ModelSettingsContext';
import DevOverlay from './subsystems/ui-overlay/DevOverlay';

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
