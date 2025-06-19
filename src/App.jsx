import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import MuseumLayout from './subsystems/museum-layout/components/MuseumLayout';
import './App.css';
import { useState } from 'react';

import { SceneWithRoomEnvironment } from './subsystems/lighting/SceneWithRoomEnvironment';
import CameraManager from './subsystems/first-person-movement/components/CameraManager';
import FirstPersonMovementController from './subsystems/first-person-movement/components/FirstPersonMovementController';
import PlayerTracker from './subsystems/first-person-movement/components/PlayerTracker';

import { SettingsProvider, useSettings } from './subsystems/ui-overlay/SettingsContext';
import UIOverlay from './subsystems/ui-overlay/UIOverlay';
import { ModelSettingsContext } from './subsystems/ui-overlay/model-selector/ModelSettingsContext';
import DevOverlay from './subsystems/ui-overlay/DevOverlay';

import { MuseumProvider, useMuseum } from './subsystems/museum-layout/components/MuseumProvider'; // 👈 New import

function RoomLogger() {
  const { settings } = useSettings();
  const { roomData } = useMuseum();

  if (!roomData || roomData.length === 0) return null;

  const table = roomData.map((room) => ({
    Room: room.name,
    Visited: !!settings.visitedRooms?.[room.id],
  }));

  //console.table(table);
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

  const { roomData, roomPositions, regenerateMuseum } = useMuseum(); // 👈 Global access to museum data

  const firstRoomPosition = roomPositions && roomPositions.length > 0 ? roomPositions[0] : { x: 0, z: 0 };

  return (
    <ModelSettingsContext.Provider value={{ customModels, handleModelChange }}>
      <div className="app-container">
        <div
          className="canvas-container"
          style={{ width: overlayVisible ? '60vw' : '100vw' }}
        >
          <Canvas>
            <Stats />
            <PlayerTracker
              roomPositions={roomPositions}
              roomData={roomData}
            />
            <CameraManager
              cameraMode={cameraMode}
              initialPosition={[firstRoomPosition.x, 1.7, firstRoomPosition.z]}
            />
            {cameraMode === 'orbit' && <OrbitControls />}
            {cameraMode === 'firstperson' && (
              <FirstPersonMovementController cameraMode={cameraMode} />
            )}

            <SceneWithRoomEnvironment />

            {roomData.length > 0 && (
              <>
                <MuseumLayout />
                <RoomLogger />
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

        <UIOverlay roomData={roomData} />

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
      <MuseumProvider>
        <AppContent />
      </MuseumProvider>
    </SettingsProvider>
  );
}

export default App;
