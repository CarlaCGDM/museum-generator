import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D } from 'three';

const FloorTilesInstanced = ({
  positions = [],
  tileSize = 1,
}) => {
  const instancedRef = useRef();

  const floorGLB = useLoader(GLTFLoader, '/models/tiles/HighPerformanceTest_LODs/LOD_05.glb');

  const geometry = useMemo(() => floorGLB.scene.children[0].geometry.clone(), [floorGLB]);
  const material = useMemo(() => floorGLB.scene.children[0].material.clone(), [floorGLB]);

  useEffect(() => {
    if (!instancedRef.current) return;

    const tempObj = new Object3D();
    instancedRef.current.count = positions.length;
    instancedRef.current.frustumCulled = false;

    positions.forEach((pos, i) => {
      tempObj.position.set(pos[0], pos[1], pos[2]);
      tempObj.rotation.set(0, 0, 0);
      tempObj.scale.set(tileSize, 1, tileSize);
      tempObj.updateMatrix();
      instancedRef.current.setMatrixAt(i, tempObj.matrix);
    });

    instancedRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, tileSize]);

  if (!geometry || !material || positions.length === 0) return null;

  return (
    <instancedMesh
      ref={instancedRef}
      args={[geometry, material, positions.length]}
      castShadow
      receiveShadow
    />
  );
};

export default FloorTilesInstanced;
