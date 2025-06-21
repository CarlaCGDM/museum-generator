import React, { Suspense, useRef, useMemo } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const personModels = [
  'People01_LODs', 'People02_LODs', 'People03_LODs',
  'People04_LODs', 'People05_LODs', 'People06_LODs',
  'People07_LODs', 'People08_LODs', 'People09_LODs',
];

const PersonModel = ({ modelFolder, meshRef }) => {
  const lodPaths = [
    `/models/decor/people/${modelFolder}/LOD_02.glb`,
    `/models/decor/people/${modelFolder}/LOD_01.glb`,
    `/models/decor/people/${modelFolder}/LOD_00.glb`,
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
      <meshStandardMaterial color="gray" />
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
    console.warn('StaticPerson LOD error:', error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const StaticPerson = ({ position }) => {
  const meshRef = useRef();

  const modelFolder = useMemo(() => {
    const i = Math.floor(Math.random() * personModels.length);
    return personModels[i];
  }, []);

  const randomYRotation = useMemo(() => Math.random() * 2 * Math.PI, []);
  const dimensions = { width: 0.6, height: 2.0, depth: 0.6 };

  return (
    <group position={position} rotation={[0, randomYRotation, 0]}>
      <GLTFErrorBoundary fallback={<FallbackBox dimensions={dimensions} />}>
        <Suspense fallback={<FallbackBox dimensions={dimensions} />}>
          <PersonModel modelFolder={modelFolder} meshRef={meshRef} />
        </Suspense>
      </GLTFErrorBoundary>
    </group>
  );
};

export default StaticPerson;
