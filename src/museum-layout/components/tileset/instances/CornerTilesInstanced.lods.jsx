import { useLoader, useThree, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D, Vector3 } from 'three';

const directionToRotationY = (dir) => {
  switch (dir) {
    case 'north': return 0;
    case 'west': return Math.PI / 2;
    case 'south': return Math.PI;
    case 'east': return -Math.PI / 2;
    default: return 0;
  }
};

const CornerTilesInstanced = ({ positions = [], directions = [], tileSize = 1, roomPosition, innerGroupOffset }) => {
  const { camera } = useThree();

  const wallRefs = [useRef(), useRef(), useRef()];
  const floorRefs = [useRef(), useRef(), useRef()];

  const wallLODGlbs = useLoader(GLTFLoader, [
    '/models/tiles/Wall_LODs/LOD_02.glb',
    '/models/tiles/Wall_LODs/LOD_01.glb',
    '/models/tiles/Wall_LODs/LOD_00.glb',
  ]);

  const floorLODGlbs = useLoader(GLTFLoader, [
    '/models/tiles/Floor_LODs/LOD_02.glb',
    '/models/tiles/Floor_LODs/LOD_01.glb',
    '/models/tiles/Floor_LODs/LOD_00.glb',
  ]);

  const wallLODs = useMemo(() => wallLODGlbs.map(gltf => {
    const mesh = gltf.scene.children[0];
    return {
      geometry: mesh.geometry.clone(),
      material: mesh.material.clone(),
    };
  }), [wallLODGlbs]);

  const floorLODs = useMemo(() => floorLODGlbs.map(gltf => {
    const mesh = gltf.scene.children[0];
    return {
      geometry: mesh.geometry.clone(),
      material: mesh.material.clone(),
    };
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
      groups.every((g, i) =>
        g.length === current[i].length &&
        g.every((v, idx) => v === current[i][idx])
      );

    if (!same) {
      lodGroupsRef.current = groups;
      wallRefs.forEach((ref, i) => updateWallInstances(ref, groups[i], positions, directions, tileSize));
      floorRefs.forEach((ref, i) => updateFloorInstances(ref, groups[i], positions, tileSize));
    }
  });

  const updateWallInstances = (ref, indices, positions, directions, scale) => {
    if (!ref.current) return;
    const tempObj1 = new Object3D();
    const tempObj2 = new Object3D();
    ref.current.count = indices.length * 2;
    ref.current.frustumCulled = false;

    indices.forEach((i, idx) => {
      const pos = positions[i];
      const dir = directions[i] || 'north';
      const rotY = directionToRotationY(dir);

      // First bar (facing z-)
      tempObj1.position.set(pos[0], pos[1], pos[2]);
      tempObj1.rotation.set(0, rotY, 0);
      tempObj1.scale.set(scale, scale, scale);
      const back1 = new Vector3(0, 0, -0.4);
      back1.applyEuler(tempObj1.rotation);
      tempObj1.position.add(back1);
      tempObj1.updateMatrix();
      ref.current.setMatrixAt(idx * 2, tempObj1.matrix);

      // Second bar (facing x- rotated 90deg)
      tempObj2.position.set(pos[0], pos[1], pos[2]);
      tempObj2.rotation.set(0, rotY + Math.PI / 2, 0);
      tempObj2.scale.set(scale, scale, scale);
      const back2 = new Vector3(0, 0, -0.4);
      back2.applyEuler(tempObj2.rotation);
      tempObj2.position.add(back2);
      tempObj2.updateMatrix();
      ref.current.setMatrixAt(idx * 2 + 1, tempObj2.matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
  };

  const updateFloorInstances = (ref, indices, positions, scale) => {
    if (!ref.current) return;
    const tempObj = new Object3D();
    ref.current.count = indices.length;
    ref.current.frustumCulled = false;

    indices.forEach((i, idx) => {
      const pos = positions[i];
      tempObj.position.set(pos[0], pos[1], pos[2]);
      tempObj.rotation.set(0, 0, 0);
      tempObj.scale.set(scale, 1, scale);
      tempObj.updateMatrix();
      ref.current.setMatrixAt(idx, tempObj.matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
  };

  useMemo(() => {
    if (!wallLODs.length || !floorLODs.length || positions.length === 0) return;

    wallRefs.forEach((ref, i) => updateWallInstances(ref, lodGroupsRef.current[i], positions, directions, tileSize));
    floorRefs.forEach((ref, i) => updateFloorInstances(ref, lodGroupsRef.current[i], positions, tileSize));
  }, [wallLODs, floorLODs, positions, directions, tileSize]);

  if (!wallLODs.length || !floorLODs.length || positions.length === 0) return null;

  return (
    <group>
      {wallLODs.map(({ geometry, material }, i) => (
        <instancedMesh
          key={`corner-wall-${i}`}
          ref={wallRefs[i]}
          args={[geometry, material, positions.length * 2]}
          castShadow
          receiveShadow
        />
      ))}

      {floorLODs.map(({ geometry, material }, i) => (
        <instancedMesh
          key={`corner-floor-${i}`}
          ref={floorRefs[i]}
          args={[geometry, material, positions.length]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
};

export default CornerTilesInstanced;

