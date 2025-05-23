import { useLoader, useThree, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D, Vector3 } from 'three';

const FloorTilesInstanced = ({ positions = [], tileSize = 1, roomPosition, innerGroupOffset }) => {
  const { camera } = useThree();

  const lodMeshRefs = [useRef(), useRef(), useRef()];
  const lodMeshes = useLoader(GLTFLoader, [
    '/models/tiles/Floor_LODs/LOD_02.glb',
    '/models/tiles/Floor_LODs/LOD_01.glb',
    '/models/tiles/Floor_LODs/LOD_00.glb',
  ]);

  const lodLevels = useMemo(() =>
    lodMeshes.map(gltf => {
      const mesh = gltf.scene.children[0];
      return {
        geometry: mesh.geometry.clone(),
        material: mesh.material.clone(),
      };
    }),
    [lodMeshes]
  );

  const lodDistances = [10, 25]; // base thresholds
  const lodHysteresis = 1; // buffer to reduce flicker (e.g., +1 unit margin)
  const lodGroupsRef = useRef([[], [], []]);
  const frameCountRef = useRef(0);

  useFrame(() => {
    if (!camera || !roomPosition || !innerGroupOffset) return;

    frameCountRef.current++;

    // Only update LODs every 20 frames
    if (frameCountRef.current % 60 !== 0) return;

    const groups = [[], [], []];
    const posVec = new Vector3();

    positions.forEach((localPos, i) => {
      posVec.set(
        roomPosition[0] + innerGroupOffset[0] + localPos[0],
        roomPosition[1] + innerGroupOffset[1] + localPos[1],
        roomPosition[2] + innerGroupOffset[2] + localPos[2]
      );

      const distSq = camera.position.distanceToSquared(posVec);

      if (distSq < (lodDistances[0] - lodHysteresis) ** 2) groups[0].push(i);
      else if (distSq < (lodDistances[1] - lodHysteresis) ** 2) groups[1].push(i);
      else groups[2].push(i);
    });

    const currentGroups = lodGroupsRef.current;
    const same =
      groups.every((grp, i) =>
        grp.length === currentGroups[i].length &&
        grp.every((val, idx) => val === currentGroups[i][idx])
      );

    if (!same) {
      lodGroupsRef.current = groups;
      lodMeshRefs.forEach((ref, lodIndex) => {
        updateInstances(ref, groups[lodIndex]);
      });
    }
  });

  const updateInstances = (ref, indices, scale = tileSize) => {
    if (!ref.current) return;
    const tempObj = new Object3D();
    ref.current.count = indices.length;
    ref.current.frustumCulled = false;
    indices.forEach((i, idx) => {
      const pos = positions[i];
      tempObj.position.set(pos[0], pos[1], pos[2]);
      tempObj.scale.set(scale, 1, scale);
      tempObj.rotation.set(0, 0, 0);
      tempObj.updateMatrix();
      ref.current.setMatrixAt(idx, tempObj.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  };

  useMemo(() => {
    if (!lodLevels.length || positions.length === 0) return;
    lodMeshRefs.forEach((ref, lodIndex) => {
      updateInstances(ref, lodGroupsRef.current[lodIndex]);
    });
  }, [lodLevels, positions, tileSize]);

  if (!lodLevels.length || positions.length === 0) return null;

  return (
    <group>
      {lodLevels.map(({ geometry, material }, i) => (
        <instancedMesh
          key={`lod-${i}`}
          ref={lodMeshRefs[i]}
          args={[geometry, material, positions.length]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
};

export default FloorTilesInstanced;
