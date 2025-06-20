import React, { useEffect, useMemo, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D, Vector3, FrontSide } from 'three';
import { useModelSettings } from '../../../../ui-overlay/model-selector/ModelSettingsContext';
import { FLOOR_LAYER, WALL_LAYER } from '../../../../first-person-movement/utils/layers';
import { useMuseum } from '../../MuseumProvider';

const directionToRotationY = (dir) => {
  switch (dir) {
    case 'east': return -Math.PI / 2;
    case 'south': return Math.PI;
    case 'west': return Math.PI / 2;
    default: return 0;
  }
};

const DoorTilesInstanced = ({
  positions = [],
  directions = [],
  tileSize = 1,
  roomIndex,
}) => {
  const wallRef = useRef();
  const floorRef = useRef();
  const ceilingRef = useRef();

  const { customModels } = useModelSettings();
  const { maxPropHeights } = useMuseum();

  const wallGlbUrl = customModels?.wall || '/models/tiles/Wall_LODs/Wall.glb';
  const floorGlbUrl = customModels?.floor || '/models/tiles/Floor_LODs/Floor.glb';
  const ceilingGlbUrl = customModels?.ceiling || '/models/tiles/Ceiling_LODs/Ceiling.glb';

  const [wallGLB, floorGLB, ceilingGLB] = useLoader(
    GLTFLoader,
    [wallGlbUrl, floorGlbUrl, ceilingGlbUrl]
  );

  const wallGeo = useMemo(() => wallGLB.scene.children[0].geometry.clone(), [wallGLB]);
  const wallMat = useMemo(() => wallGLB.scene.children[0].material.clone(), [wallGLB]);

  const floorGeo = useMemo(() => floorGLB.scene.children[0].geometry.clone(), [floorGLB]);
  const floorMat = useMemo(() => floorGLB.scene.children[0].material.clone(), [floorGLB]);

  const ceilingGeo = useMemo(() => ceilingGLB.scene.children[0].geometry.clone(), [ceilingGLB]);
  const ceilingMat = useMemo(() => ceilingGLB.scene.children[0].material.clone(), [ceilingGLB]);
  ceilingMat.side = FrontSide;

  const roomHeight = Math.max(5, Math.ceil((maxPropHeights?.[roomIndex] ?? 0) + 1));

  const updateInstances = () => {
    if (!wallRef.current || !floorRef.current || !ceilingRef.current) return;

    const tempWall = new Object3D();
    const tempFloor = new Object3D();
    const tempCeiling = new Object3D();

    // Floor (unchanged)
    floorRef.current.count = positions.length;
    positions.forEach((pos, i) => {
      tempFloor.position.set(pos[0], 0, pos[2]);
      tempFloor.rotation.set(0, 0, 0);
      tempFloor.scale.set(tileSize, 1, tileSize);
      tempFloor.updateMatrix();
      floorRef.current.setMatrixAt(i, tempFloor.matrix);
    });

    // Walls above door opening (from 4m up to roomHeight - 1)
    // This creates an empty space where the lintel used to be (at 3m height)
    const wallStartHeight = 4;
    const wallCount = Math.max(0, roomHeight - wallStartHeight);
    wallRef.current.count = positions.length * wallCount;

    let wallInstanceIndex = 0;
    positions.forEach((pos, i) => {
      const dir = directions[i] || 'north';
      const rotY = directionToRotationY(dir);

      for (let j = 0; j < wallCount; j++) {
        const height = wallStartHeight + j;
        tempWall.position.set(pos[0], height, pos[2]);
        tempWall.rotation.set(0, rotY, 0);
        tempWall.scale.set(tileSize, tileSize, tileSize);

        const offset = new Vector3(0, 0, -0.3).applyEuler(tempWall.rotation);
        tempWall.position.add(offset);
        tempWall.updateMatrix();
        wallRef.current.setMatrixAt(wallInstanceIndex++, tempWall.matrix);
      }
    });

    // Ceiling at room height (ALWAYS placed, even if roomHeight is 4)
    ceilingRef.current.count = positions.length;
    positions.forEach((pos, i) => {
      tempCeiling.position.set(pos[0], roomHeight, pos[2]);
      tempCeiling.rotation.set(0, 0, 0);
      tempCeiling.scale.set(tileSize, 1, tileSize);
      tempCeiling.updateMatrix();
      ceilingRef.current.setMatrixAt(i, tempCeiling.matrix);
    });

    // Update all matrices
    floorRef.current.instanceMatrix.needsUpdate = true;
    wallRef.current.instanceMatrix.needsUpdate = true;
    ceilingRef.current.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    updateInstances();
  }, [positions, directions, tileSize, roomHeight]);

  if (!wallGeo || !floorGeo || !ceilingGeo || positions.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={floorRef}
        args={[floorGeo, floorMat, positions.length]}
        castShadow
        receiveShadow
        onUpdate={(self) => self.layers.set(FLOOR_LAYER)}
      />
      <instancedMesh
        ref={wallRef}
        args={[wallGeo, wallMat, positions.length * Math.max(0, roomHeight - 4)]}
        castShadow
        receiveShadow
        onUpdate={(self) => self.layers.set(WALL_LAYER)}
      />
      <instancedMesh
        ref={ceilingRef}
        args={[ceilingGeo, ceilingMat, positions.length]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default DoorTilesInstanced;