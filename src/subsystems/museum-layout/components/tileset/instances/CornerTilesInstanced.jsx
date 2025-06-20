import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D, Vector3, FrontSide } from 'three';
import { useModelSettings } from '../../../../ui-overlay/model-selector/ModelSettingsContext';
import { FLOOR_LAYER, WALL_LAYER } from '../../../../first-person-movement/utils/layers';
import { useMuseum } from '../../MuseumProvider';

const directionToRotationY = (dir) => {
  switch (dir) {
    case 'north': return 0;
    case 'west': return Math.PI / 2;
    case 'south': return Math.PI;
    case 'east': return -Math.PI / 2;
    default: return 0;
  }
};

const CornerTilesInstanced = ({
  positions = [],
  directions = [],
  tileSize = 1,
  roomIndex,
}) => {
  const wallRef = useRef();
  const floorRef = useRef();
  const ceilingRef = useRef();
  const skirtingRef = useRef(); // NEW

  const { customModels } = useModelSettings();
  const { maxPropHeights } = useMuseum();

  const wallGlbUrl = customModels?.wall || '/models/tiles/Wall_LODs/Wall.glb';
  const floorGlbUrl = customModels?.floor || '/models/tiles/Floor_LODs/Floor.glb';
  const ceilingGlbUrl = customModels?.ceiling || '/models/tiles/Ceiling_LODs/Ceiling.glb';
  const skirtingGlbUrl = '/models/tiles/Skirting_LODs/Skirting.glb'; // NEW

  const wallGLB = useLoader(GLTFLoader, wallGlbUrl);
  const floorGLB = useLoader(GLTFLoader, floorGlbUrl);
  const ceilingGLB = useLoader(GLTFLoader, ceilingGlbUrl);
  const skirtingGLB = useLoader(GLTFLoader, skirtingGlbUrl); // NEW

  const wallGeo = useMemo(() => wallGLB.scene.children[0].geometry.clone(), [wallGLB]);
  const wallMat = useMemo(() => wallGLB.scene.children[0].material.clone(), [wallGLB]);

  const floorGeo = useMemo(() => floorGLB.scene.children[0].geometry.clone(), [floorGLB]);
  const floorMat = useMemo(() => floorGLB.scene.children[0].material.clone(), [floorGLB]);

  const ceilingGeo = useMemo(() => ceilingGLB.scene.children[0].geometry.clone(), [ceilingGLB]);
  const ceilingMat = useMemo(() => ceilingGLB.scene.children[0].material.clone(), [ceilingGLB]);
  ceilingMat.side = FrontSide;

  const skirtingGeo = useMemo(() => skirtingGLB.scene.children[0].geometry.clone(), [skirtingGLB]); // NEW
  const skirtingMat = useMemo(() => skirtingGLB.scene.children[0].material.clone(), [skirtingGLB]); // NEW

  const repeatCount = Math.max(5, Math.ceil((maxPropHeights?.[roomIndex] ?? 0) + 1));

  const updateInstances = (ref, isWall = false, isCeiling = false, isSkirting = false) => {
    if (!ref.current) return;

    const tempObj = new Object3D();
    let instanceCount = 0;

    if (isWall) {
      instanceCount = positions.length * 2 * repeatCount;
      ref.current.count = instanceCount;

      let instanceIndex = 0;
      positions.forEach((pos, i) => {
        const dir = directions[i] || 'north';
        const rotY = directionToRotationY(dir);

        for (let j = 0; j < repeatCount; j++) {
          // First wall (primary direction)
          tempObj.position.set(pos[0], j, pos[2]);
          tempObj.rotation.set(0, rotY, 0);
          tempObj.scale.set(tileSize, tileSize, tileSize);
          const offset1 = new Vector3(0, 0, -0.3).applyEuler(tempObj.rotation);
          tempObj.position.add(offset1);
          tempObj.updateMatrix();
          ref.current.setMatrixAt(instanceIndex++, tempObj.matrix);

          // Second wall (perpendicular)
          tempObj.position.set(pos[0], j, pos[2]);
          tempObj.rotation.set(0, rotY + Math.PI / 2, 0);
          tempObj.scale.set(tileSize, tileSize, tileSize);
          const offset2 = new Vector3(0, 0, -0.3).applyEuler(tempObj.rotation);
          tempObj.position.add(offset2);
          tempObj.updateMatrix();
          ref.current.setMatrixAt(instanceIndex++, tempObj.matrix);
        }
      });
    } else if (isSkirting) {
      instanceCount = positions.length * 2;
      ref.current.count = instanceCount;

      let instanceIndex = 0;
      positions.forEach((pos, i) => {
        const dir = directions[i] || 'north';
        const rotY = directionToRotationY(dir);

        // First skirting (primary direction)
        tempObj.position.set(pos[0], 0, pos[2]);
        tempObj.rotation.set(0, rotY, 0);
        tempObj.scale.set(tileSize, tileSize, tileSize);
        const offset1 = new Vector3(0, 0, -0.3).applyEuler(tempObj.rotation);
        tempObj.position.add(offset1);
        tempObj.updateMatrix();
        ref.current.setMatrixAt(instanceIndex++, tempObj.matrix);

        // Second skirting (perpendicular)
        tempObj.position.set(pos[0], 0, pos[2]);
        tempObj.rotation.set(0, rotY + Math.PI / 2, 0);
        tempObj.scale.set(tileSize, tileSize, tileSize);
        const offset2 = new Vector3(0, 0, -0.3).applyEuler(tempObj.rotation);
        tempObj.position.add(offset2);
        tempObj.updateMatrix();
        ref.current.setMatrixAt(instanceIndex++, tempObj.matrix);
      });
    } else if (isCeiling) {
      instanceCount = positions.length;
      ref.current.count = instanceCount;

      const ceilingHeight = repeatCount;
      positions.forEach((pos, i) => {
        tempObj.position.set(pos[0], ceilingHeight, pos[2]);
        tempObj.rotation.set(0, 0, 0);
        tempObj.scale.set(tileSize, 1, tileSize);
        tempObj.updateMatrix();
        ref.current.setMatrixAt(i, tempObj.matrix);
      });
    } else {
      // Floor
      instanceCount = positions.length;
      ref.current.count = instanceCount;

      positions.forEach((pos, i) => {
        tempObj.position.set(pos[0], 0, pos[2]);
        tempObj.rotation.set(0, 0, 0);
        tempObj.scale.set(tileSize, 1, tileSize);
        tempObj.updateMatrix();
        ref.current.setMatrixAt(i, tempObj.matrix);
      });
    }

    ref.current.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    updateInstances(wallRef, true, false);
    updateInstances(floorRef, false, false);
    updateInstances(ceilingRef, false, true);
    updateInstances(skirtingRef, false, false, true); // NEW
  }, [positions, directions, tileSize]);

  if (!wallGeo || !floorGeo || !ceilingGeo || !skirtingGeo || positions.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={wallRef}
        args={[wallGeo, wallMat, positions.length * 2 * repeatCount]}
        castShadow
        receiveShadow
        onUpdate={(self) => self.layers.set(WALL_LAYER)}
      />
      <instancedMesh
        ref={floorRef}
        args={[floorGeo, floorMat, positions.length]}
        castShadow
        receiveShadow
        onUpdate={(self) => self.layers.set(FLOOR_LAYER)}
      />
      <instancedMesh
        ref={ceilingRef}
        args={[ceilingGeo, ceilingMat, positions.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={skirtingRef}
        args={[skirtingGeo, skirtingMat, positions.length * 2]} // 2 skirting per corner
        castShadow
        receiveShadow
        onUpdate={(self) => self.layers.set(FLOOR_LAYER)} // Optional layer setting
      />
    </group>
  );
};

export default CornerTilesInstanced;
