// utils/ModelLoader.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export async function loadModel(path) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(path);
  return gltf.scene;
}

export function calculateModelDimensions(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  return {
    width: size.x,
    depth: size.z, 
    height: size.y,
    area: size.x * size.z
  };
}