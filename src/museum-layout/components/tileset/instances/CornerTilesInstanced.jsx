import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
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

const CornerTilesInstanced = ({
  positions = [],
  directions = [],
  tileSize = 1,
}) => {
  const wallRef = useRef();
  const floorRef = useRef();

  const wallGLB = useLoader(GLTFLoader, '/models/tiles/Wall_LODs/LOD_02.glb');
  const floorGLB = useLoader(GLTFLoader, '/models/tiles/Floor_LODs/LOD_02.glb',);

  const wallGeo = useMemo(() => wallGLB.scene.children[0].geometry.clone(), [wallGLB]);
  const wallMat = useMemo(() => wallGLB.scene.children[0].material.clone(), [wallGLB]);

  const floorGeo = useMemo(() => floorGLB.scene.children[0].geometry.clone(), [floorGLB]);
  const floorMat = useMemo(() => floorGLB.scene.children[0].material.clone(), [floorGLB]);

  useEffect(() => {
    if (!wallRef.current || !floorRef.current) return;

    const tempWall1 = new Object3D();
    const tempWall2 = new Object3D();
    const tempFloor = new Object3D();

    wallRef.current.count = positions.length * 2;
    wallRef.current.frustumCulled = false;

    floorRef.current.count = positions.length;
    floorRef.current.frustumCulled = false;

    positions.forEach((pos, i) => {
      const dir = directions[i] || 'north';
      const rotY = directionToRotationY(dir);

      // First wall (facing z-)
      tempWall1.position.set(pos[0], pos[1], pos[2]);
      tempWall1.rotation.set(0, rotY, 0);
      tempWall1.scale.set(tileSize, tileSize, tileSize);
      const offset1 = new Vector3(0, 0, -0.4).applyEuler(tempWall1.rotation);
      tempWall1.position.add(offset1);
      tempWall1.updateMatrix();
      wallRef.current.setMatrixAt(i * 2, tempWall1.matrix);

      // Second wall (facing x-, rotated +90deg)
      tempWall2.position.set(pos[0], pos[1], pos[2]);
      tempWall2.rotation.set(0, rotY + Math.PI / 2, 0);
      tempWall2.scale.set(tileSize, tileSize, tileSize);
      const offset2 = new Vector3(0, 0, -0.4).applyEuler(tempWall2.rotation);
      tempWall2.position.add(offset2);
      tempWall2.updateMatrix();
      wallRef.current.setMatrixAt(i * 2 + 1, tempWall2.matrix);

      // Floor
      tempFloor.position.set(pos[0], pos[1], pos[2]);
      tempFloor.rotation.set(0, 0, 0);
      tempFloor.scale.set(tileSize, 1, tileSize);
      tempFloor.updateMatrix();
      floorRef.current.setMatrixAt(i, tempFloor.matrix);
    });

    wallRef.current.instanceMatrix.needsUpdate = true;
    floorRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, directions, tileSize]);

  if (!wallGeo || !floorGeo || positions.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={wallRef}
        args={[wallGeo, wallMat, positions.length * 2]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={floorRef}
        args={[floorGeo, floorMat, positions.length]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default CornerTilesInstanced;
