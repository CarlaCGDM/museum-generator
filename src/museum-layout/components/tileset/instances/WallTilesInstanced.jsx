import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D, Vector3, FrontSide } from 'three';
import { useModelSettings } from '../../../../ui-overlay/model-selector/ModelSettingsContext';
import { FLOOR_LAYER, WALL_LAYER } from '../../../../first-person-movement/layers';

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
  const ceilingRef = useRef();

  const { customModels } = useModelSettings();

  const wallGlbUrl = customModels?.wall || '/models/tiles/Wall_LODs/Wall.glb';
  const floorGlbUrl = customModels?.floor || '/models/tiles/Floor_LODs/Floor.glb';
  const ceilingGlbUrl = customModels?.ceiling || '/models/tiles/Ceiling_LODs/Ceiling.glb';

  const wallGLB = useLoader(GLTFLoader, wallGlbUrl);
  const floorGLB = useLoader(GLTFLoader, floorGlbUrl);
  const ceilingGLB = useLoader(GLTFLoader, ceilingGlbUrl);

  const wallGeometry = useMemo(() => wallGLB.scene.children[0].geometry.clone(), [wallGLB]);
  const wallMaterial = useMemo(() => wallGLB.scene.children[0].material.clone(), [wallGLB]);

  const floorGeometry = useMemo(() => floorGLB.scene.children[0].geometry.clone(), [floorGLB]);
  const floorMaterial = useMemo(() => floorGLB.scene.children[0].material.clone(), [floorGLB]);

  const ceilingGeometry = useMemo(() => ceilingGLB.scene.children[0].geometry.clone(), [ceilingGLB]);
  const ceilingMaterial = useMemo(() => ceilingGLB.scene.children[0].material.clone(), [ceilingGLB]);
  ceilingMaterial.side = FrontSide;

  const updateInstances = (ref, isWall = false, isCeiling = false) => {
    if (!ref.current) return;
    const tempObj = new Object3D();
    ref.current.count = positions.length;
    ref.current.frustumCulled = false;

    positions.forEach((pos, i) => {
      const dir = directions[i] || 'north';
      const rotY = isWall ? directionToRotationY(dir) : 0;

      let yPos = pos[1];

      tempObj.position.set(pos[0], yPos, pos[2]);
      tempObj.rotation.set(0, rotY, 0);

      // Scale ceiling same as floor, walls scaled differently
      if (isWall) {
        tempObj.scale.set(tileSize, tileSize, tileSize);
        const offset = new Vector3(0, 0, -0.3);
        offset.applyEuler(tempObj.rotation);
        tempObj.position.add(offset);
      } else {
        tempObj.scale.set(tileSize, 1, tileSize);
      }

      tempObj.updateMatrix();
      ref.current.setMatrixAt(i, tempObj.matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    updateInstances(wallRef, true, false);
    updateInstances(floorRef, false, false);
    updateInstances(ceilingRef, false, true);
  }, [positions, directions, tileSize]);

  useEffect(() => {
    if (wallRef.current) {
      wallRef.current.layers.set(WALL_LAYER);
    }
    if (floorRef.current) {
      floorRef.current.layers.set(FLOOR_LAYER);
    }
    if (ceilingRef.current) {
      ceilingRef.current.layers.set(0); // Or disable raycasting if needed
    }
  }, []);


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
      <instancedMesh
        ref={ceilingRef}
        args={[ceilingGeometry, ceilingMaterial, positions.length]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default WallTilesInstanced;
