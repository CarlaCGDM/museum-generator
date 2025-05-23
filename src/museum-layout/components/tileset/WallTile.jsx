import React, { useMemo, useRef, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const WallTile = ({ tileSize = 1, direction = 'north', color = '#444' }) => {
  const ref = useRef();

  // Rotation for the wall
  const rotationY = useMemo(() => {
    switch (direction) {
      case 'east': return -Math.PI / 2;
      case 'south': return Math.PI;
      case 'west': return Math.PI / 2;
      default: return 0;
    }
  }, [direction]);

  // Load LODs for wall
  const wallLODGlbs = useLoader(GLTFLoader, [
    '/models/tiles/Wall_LODs/LOD_00.glb',
    '/models/tiles/Wall_LODs/LOD_01.glb',
    '/models/tiles/Wall_LODs/LOD_02.glb',
  ]);

  // Load LODs for floor (assuming you have a similar path and files)
  const floorLODGlbs = useLoader(GLTFLoader, [
    '/models/tiles/Floor_LODs/LOD_00.glb',
    '/models/tiles/Floor_LODs/LOD_01.glb',
    '/models/tiles/Floor_LODs/LOD_02.glb',
  ]);

  // Extract geometry & material for wall LODs
  const wallLODLevels = useMemo(() => wallLODGlbs.map(gltf => {
    const mesh = gltf.scene.children[0]; // assuming first child is mesh
    return {
      geometry: mesh.geometry.clone(),
      material: mesh.material.clone(),
    };
  }), [wallLODGlbs]);

  // Extract geometry & material for floor LODs
  const floorLODLevels = useMemo(() => floorLODGlbs.map(gltf => {
    const mesh = gltf.scene.children[0]; // assuming first child is mesh
    return {
      geometry: mesh.geometry.clone(),
      material: mesh.material.clone(),
    };
  }), [floorLODGlbs]);

  const [currentLevel, setCurrentLevel] = useState(0);

  // Determine LOD level based on camera distance
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const distance = ref.current.getWorldPosition(new THREE.Vector3()).distanceTo(camera.position);
    const newLevel = distance < 10 ? 0 : distance < 25 ? 1 : 2;
    if (newLevel !== currentLevel) setCurrentLevel(newLevel);
  });

  // Wall mesh data at current LOD
  const { geometry: wallGeometry, material: wallMaterial } = wallLODLevels[currentLevel];
  // Floor mesh data at current LOD
  const { geometry: floorGeometry, material: floorMaterial } = floorLODLevels[currentLevel];

  return (
    <group ref={ref}>
      {/* Wall mesh */}
      <mesh
        position={[0, 0, -0.4]}
        rotation={[0, rotationY, 0]}
        geometry={wallGeometry}
        material={wallMaterial}
        scale={[tileSize, tileSize, tileSize]}
      />

      {/* Floor mesh */}
      <mesh
        position={[0, 0, 0]}  // floor usually at ground level
        geometry={floorGeometry}
        material={floorMaterial}
        scale={[tileSize, 1, tileSize]}
      />
    </group>
  );
};

export default WallTile;

