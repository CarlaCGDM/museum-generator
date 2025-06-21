import React, { Suspense, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

// Load and display a GLTF model with LOD
const GLTFModel = ({ model_path, dimensions, meshRef }) => {
  const lodPaths = [
    `/models/artifacts/${model_path}/LOD_02.glb`,
    `/models/artifacts/${model_path}/LOD_01.glb`,
    `/models/artifacts/${model_path}/LOD_00.glb`,
  ];
  const [lod02, lod01, lod00] = useLoader(GLTFLoader, lodPaths);

  const box = new THREE.Box3().setFromObject(lod01.scene);
  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);
  const targetSize = Math.max(dimensions.width, dimensions.height, dimensions.depth);
  const scale = targetSize / maxDimension;

  const modelHeight = size.y * scale;
  const yAdjustment = -modelHeight / 2;

  const lod = new THREE.LOD();
  [lod02, lod01, lod00].forEach((gltf, i) => {
    const scene = gltf.scene.clone();
    scene.scale.set(scale, scale, scale);
    scene.position.set(0, yAdjustment, 0);
    const distance = [5, 15, 30][i];
    lod.addLevel(scene, distance);
  });

  return <primitive ref={meshRef} object={lod} />;
};

// Fallback box for missing model
const FallbackBox = ({ dimensions, onWall, starred, group, meshRef }) => {
  const { width, height, depth } = dimensions;
  const boxColor = starred
    ? 'gold'
    : onWall
      ? 'skyblue'
      : group
        ? 'seagreen'
        : 'tomato';

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={boxColor} />
      </mesh>
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="black" wireframe />
      </mesh>
    </group>
  );
};

// Loading placeholder
const LoadingBox = ({ dimensions, meshRef }) => {
  const { width, height, depth } = dimensions;

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="gray" transparent opacity={0.5} />
    </mesh>
  );
};

// Error boundary for fallback rendering
class GLTFErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('GLTF loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const MuseumObject = ({
  id,
  name = 'Artifact',
  dimensions = { width: 1, depth: 1, height: 1 },
  onWall = false,
  starred = false,
  position = [0, 0, 0],
  model_path = null,
  group = null,
}) => {
  const mainMeshRef = useRef();
  const { width, depth, height } = dimensions;
  const yOffset = onWall ? 1.5 : height / 2;

  return (
    <group position={[position[0], yOffset, position[2]]}>
      {model_path ? (
        <GLTFErrorBoundary
          fallback={
            <FallbackBox
              dimensions={dimensions}
              onWall={onWall}
              starred={starred}
              group={group}
              meshRef={mainMeshRef}
            />
          }
        >
          <Suspense fallback={<LoadingBox dimensions={dimensions} meshRef={mainMeshRef} />}>
            <GLTFModel
              model_path={model_path}
              dimensions={dimensions}
              meshRef={mainMeshRef}
            />
          </Suspense>
        </GLTFErrorBoundary>
      ) : (
        <FallbackBox
          dimensions={dimensions}
          onWall={onWall}
          starred={starred}
          group={group}
          meshRef={mainMeshRef}
        />
      )}
    </group>
  );
};

export default MuseumObject;
