import { useLoader, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const FloorTile = ({ tileSize = 1 }) => {
  const ref = useRef();

  // Load LODs once
  const lodMeshes = useLoader(GLTFLoader, [
    '/models/tiles/Floor_LODs/LOD_02.glb',
    '/models/tiles/Floor_LODs/LOD_01.glb',
    '/models/tiles/Floor_LODs/LOD_00.glb',
  ]);

  // Extract and clone geometry/material from each LOD
  const lodLevels = useMemo(() => lodMeshes.map(gltf => {
    const mesh = gltf.scene.children[0]; // assumes root has mesh
    return {
      geometry: mesh.geometry.clone(),
      material: mesh.material.clone(),
    };
  }), [lodMeshes]);

  const [currentLevel, setCurrentLevel] = useState(0);

  // Switch LOD level based on camera distance
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const distance = ref.current.getWorldPosition(new THREE.Vector3()).distanceTo(camera.position);
    const newLevel = distance < 10 ? 0 : distance < 25 ? 1 : 2;
    if (newLevel !== currentLevel) setCurrentLevel(newLevel);
  });

  const { geometry, material } = lodLevels[currentLevel];

  return (
    <mesh ref={ref} geometry={geometry} material={material} />
  );
};

export default FloorTile;
