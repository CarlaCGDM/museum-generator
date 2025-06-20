import React from 'react';
import { useGLTF } from '@react-three/drei';

// Preload model to prevent race conditions
const DoorwayModel = () => {
  const { scene } = useGLTF('/models/decor/Doorway.glb');
  return scene.clone();
};

const ROTATION_MAP = {
  north: Math.PI,      // Faces -Z (into room from north wall)
  south: 0,            // Faces +Z (out from south wall)
  east: -Math.PI/2,    // Faces -X (into room from east wall)
  west: Math.PI/2      // Faces +X (out from west wall)
};

const Doorway = ({ direction = 'north', positionOffset = [0, 0, 0] }) => {
  return (
    <group position={positionOffset}>
      <primitive
        object={DoorwayModel()}
        rotation={[0, ROTATION_MAP[direction], 0]}
      />
    </group>
  );
};

export default React.memo(Doorway);