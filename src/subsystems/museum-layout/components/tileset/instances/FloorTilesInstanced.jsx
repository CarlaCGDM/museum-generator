import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D } from 'three';
import { useModelSettings } from '../../../../ui-overlay/model-selector/ModelSettingsContext';
import { FrontSide } from 'three';
import { FLOOR_LAYER } from '../../../../first-person-movement/utils/layers';
import { useMuseum } from '../../MuseumProvider';

const FloorTilesInstanced = ({
  positions = [],
  tileSize = 1,
  roomIndex,
}) => {
  const floorRef = useRef();
  const ceilingRef = useRef();

  const { customModels } = useModelSettings();
  const { maxPropHeights } = useMuseum();

  const floorGlbUrl = customModels?.floor || '/models/tiles/Floor_LODs/Floor.glb';
  const ceilingGlbUrl = customModels?.ceiling || '/models/tiles/Ceiling_LODs/Ceiling.glb';

  const [floorGLB, ceilingGLB] = useLoader(GLTFLoader, [floorGlbUrl, ceilingGlbUrl]);

  const floorGeometry = useMemo(() => floorGLB.scene.children[0].geometry.clone(), [floorGLB]);
  const floorMaterial = useMemo(() => floorGLB.scene.children[0].material.clone(), [floorGLB]);
  
  const ceilingGeometry = useMemo(() => ceilingGLB.scene.children[0].geometry.clone(), [ceilingGLB]);
  const ceilingMaterial = useMemo(() => ceilingGLB.scene.children[0].material.clone(), [ceilingGLB]);
  ceilingMaterial.side = FrontSide;

  const repeatCount = Math.max(5, Math.ceil((maxPropHeights?.[roomIndex] ?? 0) + 1));

  const updateInstances = (ref, isCeiling = false) => {
    if (!ref.current) return;
    
    const tempObj = new Object3D();
    ref.current.count = positions.length;
    ref.current.frustumCulled = false;

    positions.forEach((pos, i) => {
      if (isCeiling) {
        // Position ceiling at the calculated height
        tempObj.position.set(pos[0], repeatCount, pos[2]);
      } else {
        // Floor stays at ground level
        tempObj.position.set(pos[0], 0, pos[2]);
      }
      
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
      <instancedMesh
        ref={floorRef}
        args={[floorGeometry, floorMaterial, positions.length]}
        castShadow
        receiveShadow
        onUpdate={(self) => self.layers.set(FLOOR_LAYER)}
      />
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