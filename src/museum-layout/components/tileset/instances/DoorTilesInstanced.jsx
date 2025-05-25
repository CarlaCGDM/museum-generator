import React, { useEffect, useMemo, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D, Vector3, FrontSide } from 'three';
import { useModelSettings } from '../../../../ui-overlay/model-selector/ModelSettingsContext';

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
}) => {
  const lintelRef = useRef();
  const floorRef = useRef();
  const ceilingRef = useRef();

  const { customModels } = useModelSettings();

  const lintelGlbUrl = customModels?.door || '/models/tiles/Lintel_LODs/Lintel.glb';
  const floorGlbUrl = customModels?.floor || '/models/tiles/Floor_LODs/Floor.glb';
  const ceilingGlbUrl = customModels?.ceiling || '/models/tiles/Ceiling_LODs/Ceiling.glb';

  const lintelGLB = useLoader(GLTFLoader, lintelGlbUrl);
  const floorGLB = useLoader(GLTFLoader, floorGlbUrl);
  const ceilingGLB = useLoader(GLTFLoader, ceilingGlbUrl);

  const lintelGeo = useMemo(() => lintelGLB.scene.children[0].geometry.clone(), [lintelGLB]);
  const lintelMat = useMemo(() => lintelGLB.scene.children[0].material.clone(), [lintelGLB]);

  const floorGeo = useMemo(() => floorGLB.scene.children[0].geometry.clone(), [floorGLB]);
  const floorMat = useMemo(() => floorGLB.scene.children[0].material.clone(), [floorGLB]);

  const ceilingGeo = useMemo(() => ceilingGLB.scene.children[0].geometry.clone(), [ceilingGLB]);
  const ceilingMat = useMemo(() => ceilingGLB.scene.children[0].material.clone(), [ceilingGLB]);
  ceilingMat.side = FrontSide;

  useEffect(() => {
    if (!lintelRef.current || !floorRef.current || !ceilingRef.current) return;

    const tempLintel = new Object3D();
    const tempFloor = new Object3D();
    const tempCeiling = new Object3D();

    lintelRef.current.count = positions.length;
    floorRef.current.count = positions.length;
    ceilingRef.current.count = positions.length;

    lintelRef.current.frustumCulled = false;
    floorRef.current.frustumCulled = false;
    ceilingRef.current.frustumCulled = false;

    positions.forEach((pos, i) => {
      const dir = directions[i] || 'north';
      const rotY = directionToRotationY(dir);

      // Lintel
      tempLintel.position.set(pos[0], pos[1], pos[2]);
      tempLintel.rotation.set(0, rotY, 0);
      tempLintel.scale.set(tileSize, tileSize, tileSize);

      const offset = new Vector3(0, 0, -0.3).applyEuler(tempLintel.rotation);
      tempLintel.position.add(offset);

      tempLintel.updateMatrix();
      lintelRef.current.setMatrixAt(i, tempLintel.matrix);

      // Floor
      tempFloor.position.set(pos[0], pos[1], pos[2]);
      tempFloor.rotation.set(0, 0, 0);
      tempFloor.scale.set(tileSize, 1, tileSize);
      tempFloor.updateMatrix();
      floorRef.current.setMatrixAt(i, tempFloor.matrix);

      // Ceiling (no vertical offset)
      tempCeiling.position.set(pos[0], pos[1], pos[2]);
      tempCeiling.rotation.set(0, 0, 0);
      tempCeiling.scale.set(tileSize, 1, tileSize);
      tempCeiling.updateMatrix();
      ceilingRef.current.setMatrixAt(i, tempCeiling.matrix);
    });

    lintelRef.current.instanceMatrix.needsUpdate = true;
    floorRef.current.instanceMatrix.needsUpdate = true;
    ceilingRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, directions, tileSize]);

  if (!lintelGeo || !floorGeo || !ceilingGeo || positions.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={lintelRef}
        args={[lintelGeo, lintelMat, positions.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={floorRef}
        args={[floorGeo, floorMat, positions.length]}
        castShadow
        receiveShadow
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
