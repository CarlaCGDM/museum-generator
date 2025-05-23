// hooks/useFloorLODs.js
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function useFloorLODs() {
  const [lod0, lod1, lod2] = useLoader(GLTFLoader, [
    '/models/tiles/Floor_LODs/LOD_00.glb',
    '/models/tiles/Floor_LODs/LOD_01.glb',
    '/models/tiles/Floor_LODs/LOD_02.glb',
  ]);

  return [
    lod0.scene.children[0], // Assuming the mesh is first child
    lod1.scene.children[0],
    lod2.scene.children[0],
  ];
}
