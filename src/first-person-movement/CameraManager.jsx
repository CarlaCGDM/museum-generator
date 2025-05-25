import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import CustomFirstPersonLookControls from './CustomFirstPersonLookControls';

const CameraManager = ({ cameraMode }) => {
    const { set, camera: defaultCamera } = useThree();
    const orbitCameraRef = useRef();
    const firstPersonCameraRef = useRef();

    // On mode change, set active camera
    useEffect(() => {
        if (cameraMode === 'orbit' && orbitCameraRef.current) {
            set({ camera: orbitCameraRef.current });
        } else if (cameraMode === 'firstperson' && firstPersonCameraRef.current) {
            set({ camera: firstPersonCameraRef.current });
        }
    }, [cameraMode, set]);

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
                fov={60}
                near={0.1}
                far={1000}
            />
        </>
    );
};

export default CameraManager;

