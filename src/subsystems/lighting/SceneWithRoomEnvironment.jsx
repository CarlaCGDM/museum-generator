import { useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
import { PMREMGenerator } from "three";
import { useEffect } from "react";
import * as THREE from "three";

export function SceneWithRoomEnvironment() {
    const { scene, gl } = useThree();

    useEffect(() => {
        const pmremGenerator = new PMREMGenerator(gl);
        const envMap = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

        // Lower the environment map intensity
        //envMap.intensity = 0.2; // Default is 1.0, adjust between 0-1

        // Lower the renderer's overall exposure
        gl.toneMappingExposure = 0.6; // Default is 1.0

        scene.environment = envMap;
        scene.background = new THREE.Color(0x222222);
        pmremGenerator.dispose();
    }, [scene, gl]);

    useEffect(() => {
        // Add warm ambient light
        const ambientLight = new THREE.AmbientLight(0xffccaa, 0.5); // color, intensity
        scene.add(ambientLight);

        return () => {
            scene.remove(ambientLight);
        };
    }, [scene]);

    return null;
}
