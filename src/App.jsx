import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import MuseumLayout from './museum-layout/components/MuseumLayout';
import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { useDebug } from './debug/DebugContext';
import { computeRoomSizes } from './museum-layout/utils/computeRoomSizes';
import { createLogger } from './debug/utils/logger';
import Overlay from './ui-overlay/OVerlay';
import { ModelSettingsContext } from './ui-overlay/ModelSettingsContext';
import { generateRandomMuseumData } from './museum-layout/utils/generateRandomMuseumData';

function App() {
  const [customModels, setCustomModels] = useState({});
  const [roomData, setRoomData] = useState([]);
  const [layoutTrigger, setLayoutTrigger] = useState(0);
  const logComputeRoomSizes = useDebug('Layout', 'computeRoomSizes');

  const handleModelChange = (type, url) => {
    setCustomModels((prev) => ({ ...prev, [type]: url }));
  };

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
      <Canvas>
        <Stats />
        <OrbitControls />
        <ambientLight intensity={2.5} />
        <pointLight position={[10, 10, 10]} />
        {roomData.length > 0 && <MuseumLayout key={layoutTrigger} roomData={roomData} />}
      </Canvas>
      <Overlay onRegenerate={regenerateMuseum}/>
    </ModelSettingsContext.Provider>
  );
}

export default App;