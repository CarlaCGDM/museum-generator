import React, { useMemo, useRef } from 'react';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D, Vector3 } from 'three';

const directionToRotationY = (dir) => {
  switch (dir) {
    case 'east': return -Math.PI / 2;
    case 'south': return Math.PI;
    case 'west': return Math.PI / 2;
    default: return 0;
  }
};

const DoorTilesInstanced = ({ positions = [], directions = [], tileSize = 1, roomPosition, innerGroupOffset }) => {
  const { camera } = useThree();

  const lintelRefs = [useRef(), useRef(), useRef()];
  const floorRefs = [useRef(), useRef(), useRef()];

  const lintelLODGlbs = useLoader(GLTFLoader, [
    '/models/tiles/Lintel_LODs/LOD_02.glb',
    '/models/tiles/Lintel_LODs/LOD_01.glb',
    '/models/tiles/Lintel_LODs/LOD_00.glb',
  ]);

  const floorLODGlbs = useLoader(GLTFLoader, [
    '/models/tiles/Floor_LODs/LOD_02.glb',
    '/models/tiles/Floor_LODs/LOD_01.glb',
    '/models/tiles/Floor_LODs/LOD_00.glb',
  ]);

  const lintelLODs = useMemo(() => lintelLODGlbs.map(gltf => {
    const mesh = gltf.scene.children[0];
    return { geometry: mesh.geometry.clone(), material: mesh.material.clone() };
  }), [lintelLODGlbs]);

  const floorLODs = useMemo(() => floorLODGlbs.map(gltf => {
    const mesh = gltf.scene.children[0];
    return { geometry: mesh.geometry.clone(), material: mesh.material.clone() };
  }), [floorLODGlbs]);

  const lodGroupsRef = useRef([[], [], []]);
  const lodDistances = [10, 25];

  useFrame(() => {
    if (!camera || !roomPosition || !innerGroupOffset) return;

    const groups = [[], [], []];
    const posVec = new Vector3();

    positions.forEach((localPos, i) => {
      posVec.set(
        roomPosition[0] + innerGroupOffset[0] + localPos[0],
        roomPosition[1] + innerGroupOffset[1] + localPos[1],
        roomPosition[2] + innerGroupOffset[2] + localPos[2]
      );

      const distSq = camera.position.distanceToSquared(posVec);

      if (distSq < lodDistances[0] ** 2) groups[0].push(i);
      else if (distSq < lodDistances[1] ** 2) groups[1].push(i);
      else groups[2].push(i);
    });

    const current = lodGroupsRef.current;
    const same =
      groups.every((g, i) => g.length === current[i].length && g.every((v, idx) => v === current[i][idx]));

    if (!same) {
      lodGroupsRef.current = groups;
      lintelRefs.forEach((ref, i) => updateInstances(ref, groups[i], positions, directions, tileSize, true));
      floorRefs.forEach((ref, i) => updateInstances(ref, groups[i], positions, directions, tileSize, false));
    }
  });

const updateInstances = (ref, indices, positions, directions, scale, isLintel) => {
  if (!ref.current) return;
  const tempObj = new Object3D();
  ref.current.count = indices.length;
  ref.current.frustumCulled = false;

  indices.forEach((i, idx) => {
    const pos = positions[i];
    const dir = directions[i] || 'north';
    const rotY = isLintel ? directionToRotationY(dir) : 0;

    tempObj.position.set(pos[0], pos[1], pos[2]);
    tempObj.rotation.set(0, rotY, 0);
    tempObj.scale.set(scale, isLintel ? scale : 1, scale);

    if (isLintel) {
      const offsetDistance = 0.4;
      const backward = new Vector3(0, 0, -offsetDistance);
      backward.applyEuler(tempObj.rotation); // rotate offset vector by rotation
      tempObj.position.add(backward);
    }

    tempObj.updateMatrix();
    ref.current.setMatrixAt(idx, tempObj.matrix);
  });

  ref.current.instanceMatrix.needsUpdate = true;
};


  useMemo(() => {
    if (!lintelLODs.length || !floorLODs.length || positions.length === 0) return;
    lintelRefs.forEach((ref, i) => updateInstances(ref, lodGroupsRef.current[i], positions, directions, tileSize, true));
    floorRefs.forEach((ref, i) => updateInstances(ref, lodGroupsRef.current[i], positions, directions, tileSize, false));
  }, [lintelLODs, floorLODs, positions, directions, tileSize]);

  if (!lintelLODs.length || !floorLODs.length || positions.length === 0) return null;

  return (
    <group>
      {lintelLODs.map(({ geometry, material }, i) => (
        <instancedMesh
          key={`lintel-${i}`}
          ref={lintelRefs[i]}
          args={[geometry, material, positions.length]}
          castShadow
          receiveShadow
        />
      ))}

      {floorLODs.map(({ geometry, material }, i) => (
        <instancedMesh
          key={`floor-${i}`}
          ref={floorRefs[i]}
          args={[geometry, material, positions.length]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
};

export default DoorTilesInstanced;
