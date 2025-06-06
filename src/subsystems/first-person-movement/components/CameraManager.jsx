import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import CustomFirstPersonLookControls from './CustomFirstPersonLookControls';
import { WALL_LAYER, FLOOR_LAYER } from '../utils/layers';

const CameraManager = ({ cameraMode }) => {
    const { set, camera: defaultCamera, size } = useThree();
    const orbitCameraRef = useRef();
    const firstPersonCameraRef = useRef();

    // Update camera aspect ratio when size changes
    useEffect(() => {
        if (orbitCameraRef.current) {
            orbitCameraRef.current.aspect = size.width / size.height;
            orbitCameraRef.current.updateProjectionMatrix();
        }
        if (firstPersonCameraRef.current) {
            firstPersonCameraRef.current.aspect = size.width / size.height;
            firstPersonCameraRef.current.updateProjectionMatrix();
        }
    }, [size]);

    // On mode change, set active camera and update its aspect ratio
    useEffect(() => {
        if (cameraMode === 'orbit' && orbitCameraRef.current) {
            orbitCameraRef.current.aspect = size.width / size.height;
            orbitCameraRef.current.updateProjectionMatrix();
            set({ camera: orbitCameraRef.current });
        } else if (cameraMode === 'firstperson' && firstPersonCameraRef.current) {
            firstPersonCameraRef.current.aspect = size.width / size.height;
            firstPersonCameraRef.current.updateProjectionMatrix();
            set({ camera: firstPersonCameraRef.current });
        }
    }, [cameraMode, set, size]);

    useEffect(() => {
        if (firstPersonCameraRef.current) {
            firstPersonCameraRef.current.layers.enable(FLOOR_LAYER);
            firstPersonCameraRef.current.layers.enable(WALL_LAYER);
        }
        if (orbitCameraRef.current) {
            orbitCameraRef.current.layers.enable(FLOOR_LAYER);
            orbitCameraRef.current.layers.enable(WALL_LAYER);
        }
    }, []);

    return (
        <>
            <perspectiveCamera
                ref={orbitCameraRef}
                makeDefault={cameraMode === 'orbit'}
                position={[0, 20, 0]}
                fov={45}
                near={0.1}
                far={1000}
                up={[0, 1, 0]}
            />
            {cameraMode === 'firstperson' && (
                <CustomFirstPersonLookControls rotationSpeed={0.002} dampingFactor={0.1} />
            )}
            <perspectiveCamera
                ref={firstPersonCameraRef}
                makeDefault={cameraMode === 'firstperson'}
                position={[0, 1.7, 0]}
                fov={75}
                near={0.1}
                far={1000}
            />
        </>
    );
};

export default CameraManager;

