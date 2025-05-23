import React, { useMemo, useRef, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const CornerTile = ({ tileSize = 1, color = '#333' }) => {
  const ref = useRef();

  // Load wall LOD models
  const wallLODGlbs = useLoader(GLTFLoader, [
    '/models/tiles/Wall_LODs/LOD_00.glb',
    '/models/tiles/Wall_LODs/LOD_01.glb',
    '/models/tiles/Wall_LODs/LOD_02.glb',
  ]);

  // Load floor LOD models
  const floorLODGlbs = useLoader(GLTFLoader, [
    '/models/tiles/Floor_LODs/LOD_00.glb',
    '/models/tiles/Floor_LODs/LOD_01.glb',
    '/models/tiles/Floor_LODs/LOD_02.glb',
  ]);

  // Extract geometry and material for wall LODs
  const wallLODLevels = useMemo(() => wallLODGlbs.map(gltf => {
    const mesh = gltf.scene.children[0];
    return {
      geometry: mesh.geometry.clone(),
      material: mesh.material.clone(),
    };
  }), [wallLODGlbs]);

  // Extract geometry and material for floor LODs
  const floorLODLevels = useMemo(() => floorLODGlbs.map(gltf => {
    const mesh = gltf.scene.children[0];
    return {
      geometry: mesh.geometry.clone(),
      material: mesh.material.clone(),
    };
  }), [floorLODGlbs]);

  const [currentLevel, setCurrentLevel] = useState(0);

  // Update LOD level based on camera distance
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const distance = ref.current.getWorldPosition(new THREE.Vector3()).distanceTo(camera.position);
    const newLevel = distance < 10 ? 0 : distance < 25 ? 1 : 2;
    if (newLevel !== currentLevel) setCurrentLevel(newLevel);
  });

  const { geometry: wallGeometry, material: wallMaterial } = wallLODLevels[currentLevel];
  const { geometry: floorGeometry, material: floorMaterial } = floorLODLevels[currentLevel];

  return (
    <group ref={ref}>
      {/* Horizontal wall bar */}
      <mesh position={[0, 0, -0.4]} geometry={wallGeometry} material={wallMaterial} />

      {/* Vertical wall bar */}
      <mesh position={[-0.4, 0, 0]} geometry={wallGeometry} material={wallMaterial}  rotation={[0, Math.PI / 2, 0]}/>

      {/* Floor mesh */}
      <mesh geometry={floorGeometry} material={floorMaterial} position={[0, 0, 0]} />
    </group>
  );
};

export default CornerTile;
