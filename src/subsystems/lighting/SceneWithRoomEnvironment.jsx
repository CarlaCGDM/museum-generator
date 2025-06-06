import { useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
import { PMREMGenerator } from "three";
import { useEffect } from "react";
import * as THREE from "three"

export function SceneWithRoomEnvironment() {
    const { scene, gl } = useThree();

    useEffect(() => {
        const pmremGenerator = new PMREMGenerator(gl);
        const envMap = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

        scene.environment = envMap; // Apply as environment map
        // scene.background = envMap; // Optional: Set as background
        scene.background = new THREE.Color(0x222222);
        scene.environmentIntensity = 0.7; // Lower = softer reflections
        pmremGenerator.dispose(); // Clean up generator

    }, [scene, gl]);

    return null; // No need to render anything, just setting up lighting
}