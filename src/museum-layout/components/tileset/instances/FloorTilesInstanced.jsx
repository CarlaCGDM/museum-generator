import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D } from 'three';
import { useModelSettings } from '../../../../ui-overlay/model-selector/ModelSettingsContext';
import { FrontSide, BackSide, DoubleSide } from 'three';
import { MeshStandardMaterial } from 'three';

const FloorTilesInstanced = ({
  positions = [],
  tileSize = 1,
}) => {
  const floorRef = useRef();
  const ceilingRef = useRef();

  const { customModels } = useModelSettings();

  const floorGlbUrl = customModels?.floor || '/models/tiles/Floor_LODs/Floor.glb';
  const ceilingGlbUrl = customModels?.ceiling || '/models/tiles/Ceiling_LODs/Ceiling.glb';

  const [floorGLB, ceilingGLB] = useLoader(GLTFLoader, [floorGlbUrl, ceilingGlbUrl]);

  const floorGeometry = useMemo(() => floorGLB.scene.children[0].geometry.clone(), [floorGLB]);
  const floorMaterial = useMemo(() => floorGLB.scene.children[0].material.clone(), [floorGLB]);
  
  const ceilingGeometry = useMemo(() => ceilingGLB.scene.children[0].geometry.clone(), [ceilingGLB]);
  const ceilingMaterial = useMemo(() => ceilingGLB.scene.children[0].material.clone(), [ceilingGLB]);
  ceilingMaterial.side = FrontSide;

  const updateInstances = (ref, isCeiling = false) => {
    if (!ref.current) return;
    
    const tempObj = new Object3D();
    ref.current.count = positions.length;
    ref.current.frustumCulled = false;

    positions.forEach((pos, i) => {
      // Position ceiling slightly above floor (adjust Y value as needed)
      const yPos = pos[1]; // Example: 2.5 units above floor
      
      tempObj.position.set(pos[0], yPos, pos[2]);
      tempObj.rotation.set(0, 0, 0);
      tempObj.scale.set(tileSize, 1, tileSize);
      tempObj.updateMatrix();
      ref.current.setMatrixAt(i, tempObj.matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    updateInstances(floorRef);
    updateInstances(ceilingRef, true);
  }, [positions, tileSize]);

  return (
    <group>
      {/* Floor tiles */}
      <instancedMesh
        ref={floorRef}
        args={[floorGeometry, floorMaterial, positions.length]}
        castShadow
        receiveShadow
      />
      
      {/* Ceiling tiles */}
      <instancedMesh
        ref={ceilingRef}
        args={[ceilingGeometry, ceilingMaterial, positions.length]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default FloorTilesInstanced;