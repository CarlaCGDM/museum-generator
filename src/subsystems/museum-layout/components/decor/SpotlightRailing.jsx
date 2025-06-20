import React, { useRef, useMemo } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { useMuseum } from '../MuseumProvider';
import * as THREE from 'three';

const SpotlightRailing = ({ rotation = [0, 0, 0], position = [0, 0, 0], roomIndex }) => {
  const group = useRef();
  const { scene: railingScene } = useGLTF('/models/tiles/Spotlight/Railing.glb');
  const { scene: spotlightScene } = useGLTF('/models/tiles/Spotlight/Spotlight.glb');
  const { maxPropHeights } = useMuseum();

  const ceilingHeight = useMemo(() => {
    return Math.max(5, Math.ceil((maxPropHeights?.[roomIndex] ?? 0) + 1));
  }, [maxPropHeights, roomIndex]);

  const spotlights = useMemo(() => {
    const weightedChoices = [0, 0, 0, 0, 0, 0, 1, 2];
    const count = weightedChoices[Math.floor(Math.random() * weightedChoices.length)];

    const stripeWidth = 0.8; // leave 0.1m margin on each side
    const margin = 0.1;
    const startX = -stripeWidth / 2;
    const step = count > 1 ? stripeWidth / (count - 1) : 0;

    return Array.from({ length: count }).map((_, i) => {
      const jitter = THREE.MathUtils.randFloatSpread(0.05); // ±2.5cm
      const x = startX + i * step + jitter;

      const angleDeg = THREE.MathUtils.randFloat(10, 80);
      const rotationX = THREE.MathUtils.degToRad(angleDeg);

      const rotateY = Math.random() < 0.5; // 50% chance

      return {
        position: [x, 0, 0],
        rotationX,
        rotateY,
      };
    });

  }, []);


  return (
    <group
      ref={group}
      rotation={rotation}
      position={[position[0], ceilingHeight, position[2]]}
    >
      {/* Railing */}
      <Clone object={railingScene} />

      {/* Spotlights */}
      {spotlights.map((spot, i) => {
        const spotlightInstance = spotlightScene.clone(true);

        spotlightInstance.traverse((obj) => {
          if (obj.name === 'SpotlightPivot') {
            obj.rotation.x = spot.rotationX;
            obj.scale.set(4, 4, 4);
          }
        });

        return (
          <group key={i} position={spot.position}>
            <group rotation={[0, spot.rotateY ? Math.PI : 0, 0]}>
              <primitive object={spotlightInstance} />
            </group>
          </group>
        );

      })}
    </group>
  );
};

useGLTF.preload('/models/tiles/Spotlight/Railing.glb');
useGLTF.preload('/models/tiles/Spotlight/Spotlight.glb');

export default SpotlightRailing;
