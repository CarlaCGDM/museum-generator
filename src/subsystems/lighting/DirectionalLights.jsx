// src/subsystems/lighting/DirectionalLights.js
import { useMuseum } from '../museum-layout/components/MuseumProvider';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

export function DirectionalLights() {
  const { roomData, roomPositions, roomDoorInfo } = useMuseum();
  const { scene } = useThree();

  useEffect(() => {
    if (!roomData.length || !roomPositions.length) return;

    const lights = [];

    // Create a directional light for each room
    roomData.forEach((room, index) => {
      const roomPos = roomPositions[index];
      const roomCenter = {
        x: roomPos.x + room.dimensions.width / 2,
        z: roomPos.z + room.dimensions.depth / 2
      };

      const light = new THREE.DirectionalLight(0xffffff, 0.8);
      light.position.set(roomCenter.x, 3, roomCenter.z);
      
      // Optional: Aim light slightly towards the exit
      if (roomDoorInfo[index]?.exitMid) {
        light.target.position.set(
          roomDoorInfo[index].exitMid.x,
          0,
          roomDoorInfo[index].exitMid.z
        );
      } else {
        // Default target is straight down
        light.target.position.set(roomCenter.x, 0, roomCenter.z);
      }
      
      scene.add(light);
      scene.add(light.target);
      lights.push(light);
    });

    return () => {
      lights.forEach(light => {
        scene.remove(light);
        scene.remove(light.target);
      });
    };
  }, [roomData, roomPositions, roomDoorInfo, scene]);

  return null;
}