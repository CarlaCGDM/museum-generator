import { useLoader, useThree, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
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
    directions = [], // ✅ New prop
    tileSize = 1,
    roomPosition,
    innerGroupOffset
}) => {
    const { camera } = useThree();

    const wallRefs = [useRef(), useRef(), useRef()];
    const floorRefs = [useRef(), useRef(), useRef()];

    const wallLODGlbs = useLoader(GLTFLoader, [
        '/models/tiles/Wall_LODs/LOD_02.glb',
        '/models/tiles/Wall_LODs/LOD_00.glb',
        '/models/tiles/Wall_LODs/LOD_01.glb',
    ]);

    const floorLODGlbs = useLoader(GLTFLoader, [
        '/models/tiles/Floor_LODs/LOD_02.glb',
        '/models/tiles/Floor_LODs/LOD_00.glb',
        '/models/tiles/Floor_LODs/LOD_01.glb',
    ]);

    const wallLODs = useMemo(() =>
        wallLODGlbs.map(gltf => {
            const mesh = gltf.scene.children[0];
            return {
                geometry: mesh.geometry.clone(),
                material: mesh.material.clone(),
            };
        }), [wallLODGlbs]);

    const floorLODs = useMemo(() =>
        floorLODGlbs.map(gltf => {
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
            wallRefs.forEach((ref, i) =>
                updateInstances(ref, groups[i], positions, directions, tileSize, true)
            );
            floorRefs.forEach((ref, i) =>
                updateInstances(ref, groups[i], positions, directions, tileSize, false)
            );
        }
    });

    const updateInstances = (ref, indices, positions, directions, scale, isWall) => {
        if (!ref.current) return;
        const tempObj = new Object3D();
        ref.current.count = indices.length;
        ref.current.frustumCulled = false;

        indices.forEach((i, idx) => {
            const pos = positions[i];
            const dir = directions[i] || 'north';
            const rotY = isWall ? directionToRotationY(dir) : 0;

            tempObj.position.set(pos[0], pos[1], pos[2]);
            tempObj.rotation.set(0, rotY, 0);
            tempObj.scale.set(scale, isWall ? scale : 1, scale);
            if (isWall) { // Offset for wall
                // Calculate backward offset vector in local space, then apply rotation
                const offsetDistance = 0.4;
                const backward = new Vector3(0, 0, -offsetDistance);
                backward.applyEuler(tempObj.rotation); // rotate offset vector by the wall rotation
                tempObj.position.add(backward);
            }

            tempObj.updateMatrix();

            ref.current.setMatrixAt(idx, tempObj.matrix);
        });

        ref.current.instanceMatrix.needsUpdate = true;
    };

    // Init once
    useMemo(() => {
        if (!wallLODs.length || !floorLODs.length || positions.length === 0) return;

        wallRefs.forEach((ref, i) =>
            updateInstances(ref, lodGroupsRef.current[i], positions, directions, tileSize, true)
        );
        floorRefs.forEach((ref, i) =>
            updateInstances(ref, lodGroupsRef.current[i], positions, directions, tileSize, false)
        );
    }, [wallLODs, floorLODs, positions, directions, tileSize]);

    if (!wallLODs.length || !floorLODs.length || positions.length === 0) return null;

    return (
        <group>
            {wallLODs.map(({ geometry, material }, i) => (
                <instancedMesh
                    key={`wall-${i}`}
                    ref={wallRefs[i]}
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

export default WallTilesInstanced;
