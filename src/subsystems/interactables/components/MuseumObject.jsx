import React, { Suspense, useRef, useEffect } from 'react';
import { Html, useGLTF } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from "three";
import { useMuseum } from '../../museum-layout/components/MuseumProvider';

// Component to load and display GLTF model
const GLTFModel = ({ model_path, dimensions, meshRef }) => {
  const lodPaths = [
    `/models/artifacts/${model_path}/LOD_02.glb`,
    `/models/artifacts/${model_path}/LOD_01.glb`,
    `/models/artifacts/${model_path}/LOD_00.glb`,
  ];

  const [lod02, lod01, lod00] = useLoader(GLTFLoader, lodPaths);

  const box = new THREE.Box3().setFromObject(lod01.scene); // Use LOD_01 for reference
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

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

    let distance = 0;
    if (i === 0) distance = 5;       // LOD_02: closest
    else if (i === 1) distance = 15;  // LOD_01: mid
    else distance = 30;              // LOD_00: far

    lod.addLevel(scene, distance);
  });

  return <primitive ref={meshRef} object={lod} />;
};

// Fallback box component
const FallbackBox = ({ dimensions, onWall, starred, group, meshRef }) => {
  const { width, depth, height } = dimensions;

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
  const { width, depth, height } = dimensions;

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="gray" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// Error boundary component for GLTF loading
class GLTFErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('GLTF loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

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
  isPlayerInThisRoom = false,
  isPlayerNear = false,
  roomIndex = 0,
  objectIndex = 0,
}) => {
  const { addOccluderRef, removeOccluderRef, getOccluderRefsForRoom } = useMuseum();

  // Create refs for the main mesh and bounding box occluder
  const mainMeshRef = useRef();
  const arrowRef = useRef();
  const boundingBoxRef = useRef(); // FIXED: Separate ref for bounding box occluder

  const { width, depth, height } = dimensions;
  const yOffset = onWall ? 1.5 : height / 2;

  // FIXED: Register bounding box as occluder instead of main mesh
  useEffect(() => {
    if (onWall) return; // Skip wall-mounted objects for occlusion

    const objectId = `object-${roomIndex}-${objectIndex}-${id}`;

    if (boundingBoxRef.current) {
      addOccluderRef(roomIndex, objectId, boundingBoxRef);
    }

    return () => {
      removeOccluderRef(roomIndex, objectId);
    };
  }, [roomIndex, objectIndex, id, onWall, addOccluderRef, removeOccluderRef]);

  // Get occluders for this room for the label
  const roomOccluders = getOccluderRefsForRoom(roomIndex);

  return (
    <group position={[position[0], yOffset, position[2]]}>
      {/* FIXED: Invisible bounding box for occlusion */}
      {!onWall && (
        <mesh
          ref={boundingBoxRef}
          position={[0, 0, 0]}
        >
          <boxGeometry args={[width, height, depth]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={true}
          />
        </mesh>
      )}

      {/* Main Object - Try GLTF first, fallback to box */}
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
          <Suspense
            fallback={<LoadingBox dimensions={dimensions} meshRef={mainMeshRef} />}
          >
            <GLTFModel
              model_path={model_path}
              dimensions={dimensions}
              onWall={onWall}
              starred={starred}
              group={group}
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

      {/* Direction Arrow */}
      <mesh ref={arrowRef} position={[0, 0, depth / 2 + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Label with Occlusion */}
      {isPlayerInThisRoom && isPlayerNear && (
        <group position={[0, height * 0.5 + 0.25, 0]}>
          <Html
            center
            distanceFactor={10}
            style={labelStyle}
          >
            <div>{name}</div>
          </Html>
        </group>
      )}

      {/* Debug: Visible bounding box (uncomment to see occlusion bounds) */}
      {/* 
      {!onWall && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[width, height, depth]} />
          <meshBasicMaterial color="red" transparent opacity={0.2} wireframe />
        </mesh>
      )}
      */}
    </group>
  );
};

const labelStyle = {
  pointerEvents: 'none',
  fontSize: '12px',
  fontWeight: 'bold',
  background: 'white',
  padding: '2px 4px',
  borderRadius: '4px',
  color: 'black',
};

export default MuseumObject;