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
  const lintelRef = useRef();
  const wallRef = useRef();
  const floorRef = useRef();
  const ceilingRef = useRef();

  const { customModels } = useModelSettings();
  const { maxPropHeights } = useMuseum();

  const lintelGlbUrl = customModels?.door || '/models/tiles/Lintel_LODs/Lintel.glb';
  const wallGlbUrl = customModels?.wall || '/models/tiles/Wall_LODs/Wall.glb';
  const floorGlbUrl = customModels?.floor || '/models/tiles/Floor_LODs/Floor.glb';
  const ceilingGlbUrl = customModels?.ceiling || '/models/tiles/Ceiling_LODs/Ceiling.glb';

  const [lintelGLB, wallGLB, floorGLB, ceilingGLB] = useLoader(
    GLTFLoader,
    [lintelGlbUrl, wallGlbUrl, floorGlbUrl, ceilingGlbUrl]
  );

  const lintelGeo = useMemo(() => lintelGLB.scene.children[0].geometry.clone(), [lintelGLB]);
  const lintelMat = useMemo(() => lintelGLB.scene.children[0].material.clone(), [lintelGLB]);

  const wallGeo = useMemo(() => wallGLB.scene.children[0].geometry.clone(), [wallGLB]);
  const wallMat = useMemo(() => wallGLB.scene.children[0].material.clone(), [wallGLB]);

  const floorGeo = useMemo(() => floorGLB.scene.children[0].geometry.clone(), [floorGLB]);
  const floorMat = useMemo(() => floorGLB.scene.children[0].material.clone(), [floorGLB]);

  const ceilingGeo = useMemo(() => ceilingGLB.scene.children[0].geometry.clone(), [ceilingGLB]);
  const ceilingMat = useMemo(() => ceilingGLB.scene.children[0].material.clone(), [ceilingGLB]);
  ceilingMat.side = FrontSide;

  const roomHeight = Math.max(4, Math.ceil((maxPropHeights?.[roomIndex] ?? 0) + 1));

  const updateInstances = () => {
    if (!lintelRef.current || !wallRef.current || !floorRef.current || !ceilingRef.current) return;

    const tempLintel = new Object3D();
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

    // Lintel (only one per door at 3m height)
    lintelRef.current.count = positions.length;
    positions.forEach((pos, i) => {
      const dir = directions[i] || 'north';
      const rotY = directionToRotationY(dir);

      tempLintel.position.set(pos[0], 3, pos[2]);
      tempLintel.rotation.set(0, rotY, 0);
      tempLintel.scale.set(tileSize, tileSize, tileSize);

      const offset = new Vector3(0, 0, -0.3).applyEuler(tempLintel.rotation);
      tempLintel.position.add(offset);
      tempLintel.updateMatrix();
      lintelRef.current.setMatrixAt(i, tempLintel.matrix);
    });

    // Walls above lintel (from 4m up to roomHeight - 1)
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
    lintelRef.current.instanceMatrix.needsUpdate = true;
    wallRef.current.instanceMatrix.needsUpdate = true;
    ceilingRef.current.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    updateInstances();
  }, [positions, directions, tileSize, roomHeight]);

  if (!lintelGeo || !wallGeo || !floorGeo || !ceilingGeo || positions.length === 0) return null;

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
        ref={lintelRef}
        args={[lintelGeo, lintelMat, positions.length]}
        castShadow
        receiveShadow
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