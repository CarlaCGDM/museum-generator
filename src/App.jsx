import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import MuseumLayout from './museum-layout/components/MuseumLayout';
import './App.css';

import { useState, useEffect } from 'react';
import { useDebug } from './debug/DebugContext';
import { computeRoomSizes } from './museum-layout/utils/computeRoomSizes';
import museumData from './data/museum_data.json';
import { createLogger } from './debug/utils/logger';

import { generateRandomMuseumData } from './museum-layout/utils/generateRandomMuseumData';

function App() {
  const [roomData, setRoomData] = useState([]);
  const logComputeRoomSizes = useDebug('Layout', 'computeRoomSizes');

  useEffect(() => {
    async function loadLayout() {
      try {
        const logger = createLogger(logComputeRoomSizes, 'computeRoomSizes');
        const dynamicMuseumData = generateRandomMuseumData(100);
        const report = await computeRoomSizes(dynamicMuseumData, logger); //museumData for static python generated data
        setRoomData(report);
      } catch (error) {
        console.error('Layout generation failed:', error);
      }
    }

    loadLayout();
  }, []);

  return (
    <Canvas >
      <Stats />
      <OrbitControls />
      <ambientLight intensity={2.5} />
      <pointLight position={[10, 10, 10]} />
      {roomData.length > 0 && <MuseumLayout roomData={roomData} />}
    </Canvas>
  );
}


export default App;
