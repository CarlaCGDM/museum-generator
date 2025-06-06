import { useEffect, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function useClickToMove(camera, scene) {
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const targetPos = useRef(null);

  const onClick = useCallback((e) => {
    mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true); // true = recursive

    if (intersects.length > 0) {
      targetPos.current = intersects[0].point;
    }
  }, [camera, scene]);

  useEffect(() => {
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [onClick]);

  useFrame((_, delta) => {
    if (targetPos.current) {
      const dir = new THREE.Vector3().subVectors(targetPos.current, camera.position);
      const distance = dir.length();

      if (distance > 0.1) {
        dir.normalize().multiplyScalar(delta * 3);
        camera.position.add(dir);
      } else {
        targetPos.current = null;
      }
    }
  });
}
