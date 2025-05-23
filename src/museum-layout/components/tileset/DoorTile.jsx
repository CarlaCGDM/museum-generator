import React, { useMemo, useRef, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const DoorTile = ({ tileSize = 1, direction = 'north', color = '#996633' }) => {
  const ref = useRef();

  // Load lintel LOD models
  const lintelLODGlbs = useLoader(GLTFLoader, [
    '/models/tiles/Lintel_LODs/LOD_00.glb',
    '/models/tiles/Lintel_LODs/LOD_01.glb',
    '/models/tiles/Lintel_LODs/LOD_02.glb',
  ]);

  // Load floor LOD models
  const floorLODGlbs = useLoader(GLTFLoader, [
    '/models/tiles/Floor_LODs/LOD_00.glb',
    '/models/tiles/Floor_LODs/LOD_01.glb',
    '/models/tiles/Floor_LODs/LOD_02.glb',
  ]);

  // Extract geometry and material for lintel LODs
  const lintelLODLevels = useMemo(() => lintelLODGlbs.map(gltf => {
    const mesh = gltf.scene.children[0];
    return {
      geometry: mesh.geometry.clone(),
      material: mesh.material.clone(),
    };
  }), [lintelLODGlbs]);

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

  const rotationY = useMemo(() => {
    switch (direction) {
      case 'east': return -Math.PI / 2;
      case 'south': return Math.PI;
      case 'west': return Math.PI / 2;
      default: return 0;
    }
  }, [direction]);

  const { geometry: lintelGeometry, material: lintelMaterial } = lintelLODLevels[currentLevel];
  const { geometry: floorGeometry, material: floorMaterial } = floorLODLevels[currentLevel];

  return (
    <group ref={ref}>
      {/* Lintel mesh */}
      <mesh
        position={[0, 0, -0.4]}
        rotation={[0, rotationY, 0]}
        geometry={lintelGeometry}
        material={lintelMaterial}
      />
      {/* Floor mesh */}
      <mesh geometry={floorGeometry} material={floorMaterial} position={[0, 0, 0]} />
    </group>
  );
};

export default DoorTile;
