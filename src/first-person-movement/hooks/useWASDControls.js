import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';
import useKeyboardMovement from './useCustomKeyboardControls';

export default function useWASDControls(camera) {
  const velocity = useRef(new THREE.Vector3());
  const keys = useKeyboardMovement(); // ✅ This works


  useFrame((_, delta) => {
    velocity.current.set(0, 0, 0);
    const speed = 5;

    if (keys.forward) velocity.current.x -= 1;
    if (keys.backward) velocity.current.x += 1;
    if (keys.left) velocity.current.z -= 1;
    if (keys.right) velocity.current.z += 1;

    velocity.current.normalize().multiplyScalar(speed * delta);
    camera.position.add(velocity.current);
  });
}
