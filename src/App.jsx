import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import MuseumLayout from './museum-layout/components/MuseumLayout';
import './App.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebug } from './debug/DebugContext';
import { computeRoomSizes } from './museum-layout/utils/computeRoomSizes';
import { createLogger } from './debug/utils/logger';
import Overlay from './ui-overlay/Overlay';
import { ModelSettingsContext } from './ui-overlay/model-selector/ModelSettingsContext';
import { generateRandomMuseumData } from './museum-layout/utils/generateRandomMuseumData';
import CameraManager from './first-person-movement/CameraManager';
import { SceneWithRoomEnvironment } from './lighting/SceneWithRoomEnvironment';
import { Scene } from 'three';
import FirstPersonMovementController from './first-person-movement/FirstPersonMovementController';

function App() {

  // OVerlay visible
  const [overlayVisible, setOverlayVisible] = useState(true);

  const toggleOverlay = () => {
    setOverlayVisible((prev) => !prev);
  };

  // Custom tile models
  const [customModels, setCustomModels] = useState({});

  const handleModelChange = (type, url) => {
    setCustomModels((prev) => ({ ...prev, [type]: url }));
  };

  // Camera
  const [cameraMode, setCameraMode] = useState('orbit'); // fixed typo from firstPersonCamera

  // Generate room data
  const [roomData, setRoomData] = useState([]);
  const [layoutTrigger, setLayoutTrigger] = useState(0);
  const logComputeRoomSizes = useDebug('Layout', 'computeRoomSizes');

  const generateLayout = useCallback(async () => {
    try {
      const logger = createLogger(logComputeRoomSizes, 'computeRoomSizes');
      // Clear previous data first
      setRoomData([]);

      // Generate fresh data
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
    // Reset state and trigger new generation
    setLayoutTrigger(prev => prev + 1);
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
            <CameraManager cameraMode={cameraMode} />
            {cameraMode === 'orbit' && <OrbitControls />}
            {cameraMode === 'firstperson' && (
              <FirstPersonMovementController cameraMode={cameraMode} />
            )}

            <SceneWithRoomEnvironment />

            {roomData.length > 0 && (
              <MuseumLayout key={layoutTrigger} roomData={roomData} />
            )}
          </Canvas>

          <button
            className="toggle-overlay-button ui-blocker"
            onClick={toggleOverlay}
          >
            {overlayVisible ? 'Hide UI' : 'Show UI'}
          </button>
        </div>

        {overlayVisible && (
          <Overlay
            onRegenerate={regenerateMuseum}
            cameraMode={cameraMode}
            setCameraMode={setCameraMode}
          />
        )}
      </div>
    </ModelSettingsContext.Provider>
  );
}

export default App;