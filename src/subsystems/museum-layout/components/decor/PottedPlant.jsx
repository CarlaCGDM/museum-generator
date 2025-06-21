// components/decor/PottedPlant.js
import React, { Suspense, useRef, useMemo } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// Plant types available
const plantModels = ['FicusPlantLODs', 'MonsteraPlantLODs'];

const PlantModel = ({ modelFolder, meshRef }) => {
  const lodPaths = [
    `/models/decor/plants/${modelFolder}/LOD_02.glb`,
    `/models/decor/plants/${modelFolder}/LOD_01.glb`,
    `/models/decor/plants/${modelFolder}/LOD_00.glb`,
  ];

  const [lod2, lod1, lod0] = useLoader(GLTFLoader, lodPaths);

  const lod = new THREE.LOD();
  [lod2, lod1, lod0].forEach((gltf, i) => {
    const scene = gltf.scene.clone();
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0); // No vertical adjustment
    const distance = [5, 15, 30][i];
    lod.addLevel(scene, distance);
  });

  return <primitive ref={meshRef} object={lod} />;
};



const FallbackBox = ({ dimensions }) => {
  const { width, height, depth } = dimensions;
  return (
    <mesh>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
};

class GLTFErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('PottedPlant LOD error:', error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const PottedPlant = ({ position }) => {
  const meshRef = useRef();
  const modelFolder = useMemo(() => {
    const i = Math.floor(Math.random() * plantModels.length);
    return plantModels[i];
  }, []);

  const dimensions = { width: 0.6, height: 1.2, depth: 0.6 }; // Approximate bounds

  return (
    <group position={position}>
      <GLTFErrorBoundary fallback={<FallbackBox dimensions={dimensions} />}>
        <Suspense fallback={<FallbackBox dimensions={dimensions} />}>
          <PlantModel
            modelFolder={modelFolder}
            dimensions={dimensions}
            meshRef={meshRef}
          />
        </Suspense>
      </GLTFErrorBoundary>
    </group>
  );
};

export default PottedPlant;
