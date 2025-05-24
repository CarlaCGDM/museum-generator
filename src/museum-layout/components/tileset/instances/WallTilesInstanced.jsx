import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D, Vector3 } from 'three';

const directionToRotationY = (direction) => {
  switch (direction) {
    case 'east': return -Math.PI / 2;
    case 'south': return Math.PI;
    case 'west': return Math.PI / 2;
    default: return 0; // 'north' or fallback
  }
};

const WallTilesInstanced = ({
  positions = [],
  directions = [],
  tileSize = 1,
}) => {
  const wallRef = useRef();
  const floorRef = useRef();

  const wallGLB = useLoader(GLTFLoader, '/models/tiles/Wall_LODs/LOD_02.glb');
  const floorGLB = useLoader(GLTFLoader, '/models/tiles/Floor_LODs/LOD_02.glb');

  const wallGeometry = useMemo(() => wallGLB.scene.children[0].geometry.clone(), [wallGLB]);
  const wallMaterial = useMemo(() => wallGLB.scene.children[0].material.clone(), [wallGLB]);

  const floorGeometry = useMemo(() => floorGLB.scene.children[0].geometry.clone(), [floorGLB]);
  const floorMaterial = useMemo(() => floorGLB.scene.children[0].material.clone(), [floorGLB]);

  const updateInstances = (ref, isWall) => {
    if (!ref.current) return;
    const tempObj = new Object3D();
    ref.current.count = positions.length;
    ref.current.frustumCulled = false;

    positions.forEach((pos, i) => {
      const dir = directions[i] || 'north';
      const rotY = isWall ? directionToRotationY(dir) : 0;

      tempObj.position.set(pos[0], pos[1], pos[2]);
      tempObj.rotation.set(0, rotY, 0);
      tempObj.scale.set(tileSize, isWall ? tileSize : 1, tileSize);

      if (isWall) {
        const offset = new Vector3(0, 0, -0.4);
        offset.applyEuler(tempObj.rotation);
        tempObj.position.add(offset);
      }

      tempObj.updateMatrix();
      ref.current.setMatrixAt(i, tempObj.matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    updateInstances(wallRef, true);
    updateInstances(floorRef, false);
  }, [positions, directions, tileSize]);

  return (
    <group>
      <instancedMesh
        ref={wallRef}
        args={[wallGeometry, wallMaterial, positions.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={floorRef}
        args={[floorGeometry, floorMaterial, positions.length]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default WallTilesInstanced;
