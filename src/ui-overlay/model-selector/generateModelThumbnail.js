import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const generateModelThumbnail = async (file, {
  width = 300,
  height = 200,
  backgroundColor = '#ffffff'
} = {}) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(1.5, 1.5, 1.5);
    camera.lookAt(0, 0, 0);

    // Renderer (offscreen)
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const renderer = new THREE.WebGLRenderer({ canvas, preserveDrawingBuffer: true, alpha: true });
    renderer.setSize(width, height);

    // Light
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(light);

    // Load model
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      // Optional: center model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      renderer.render(scene, camera);

      const thumbnail = canvas.toDataURL('image/jpeg');
      URL.revokeObjectURL(url); // cleanup
      resolve(thumbnail);
    }, undefined, (error) => {
      reject(error);
    });
  });
};
