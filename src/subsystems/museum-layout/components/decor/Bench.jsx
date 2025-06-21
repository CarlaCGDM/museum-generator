import React, { Suspense, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const BenchModel = ({ meshRef }) => {
  const lodPaths = [
    '/models/decor/benches/BenchLODs/LOD_02.glb',
    '/models/decor/benches/BenchLODs/LOD_01.glb',
    '/models/decor/benches/BenchLODs/LOD_00.glb',
    
  ];

  const [lod2, lod1, lod0] = useLoader(GLTFLoader, lodPaths);

  const lod = new THREE.LOD();
  [lod2, lod1, lod0].forEach((gltf, i) => {
    const scene = gltf.scene.clone();
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
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
      <meshStandardMaterial color="brown" />
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
    console.warn('Bench LOD error:', error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const Bench = ({ direction = 'north', position = [0, 0, 0] }) => {
  const meshRef = useRef();
  const ROTATION_MAP = {
    north: Math.PI,
    south: 0,
    east: -Math.PI / 2,
    west: Math.PI / 2,
  };

  const dimensions = { width: 1.5, height: 0.8, depth: 0.5 }; // Approximate bounds

  return (
    <group position={position} rotation={[0, ROTATION_MAP[direction], 0]}>
      <GLTFErrorBoundary fallback={<FallbackBox dimensions={dimensions} />}>
        <Suspense fallback={<FallbackBox dimensions={dimensions} />}>
          <BenchModel meshRef={meshRef} />
        </Suspense>
      </GLTFErrorBoundary>
    </group>
  );
};

export default React.memo(Bench);
