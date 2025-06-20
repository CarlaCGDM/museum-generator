import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useModelSettings } from '../../../ui-overlay/model-selector/ModelSettingsContext';

const ROTATION_MAP = {
  north: Math.PI,
  south: 0,
  east: -Math.PI / 2,
  west: Math.PI / 2,
};

const Doorway = ({ direction = 'north', positionOffset = [0, 0, 0] }) => {
  const { customModels } = useModelSettings();
  const modelUrl = customModels?.doorway || '/models/decor/Doorway.glb'; // fallback

  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <group position={positionOffset}>
      <primitive object={clonedScene} rotation={[0, ROTATION_MAP[direction], 0]} />
    </group>
  );
};

export default React.memo(Doorway);
