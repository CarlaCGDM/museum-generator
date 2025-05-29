import { useFrame } from '@react-three/fiber';
import { useSettings } from '../ui-overlay/SettingsContext';
import { useThrottledCallback } from './useThrottledCallback';
import { useRef } from 'react';

function isPlayerInsideRoom(playerPos, roomPos, width, depth, margin = 2) {
  const [px, , pz] = playerPos;

  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  const minX = roomPos.x - halfWidth + margin;
  const maxX = roomPos.x + halfWidth - margin;
  const minZ = roomPos.z - halfDepth + margin;
  const maxZ = roomPos.z + halfDepth - margin;

  const insideX = px >= minX && px <= maxX;
  const insideZ = pz >= minZ && pz <= maxZ;

  return insideX && insideZ;
}


function PlayerTracker({ roomPositions, roomData }) {
  const { settings, updatePlayerPosition, markRoomVisited } = useSettings();
  const lastRoomIdRef = useRef(null);

  const throttledUpdate = useThrottledCallback((pos) => {
    updatePlayerPosition(pos);

    // Loop through rooms
    if (!roomPositions || roomPositions.length === 0) return;

    let foundRoom = false;
    
    for (let i = 0; i < roomPositions.length; i++) {
      const roomPos = roomPositions[i];
      const room = roomData?.[i];

      if (!room) continue;

      const { width, depth } = room.dimensions;
      const id = room.id;

      const inside = isPlayerInsideRoom(pos, roomPos, width, depth);

      if (inside) {
        foundRoom = true;
        if (!settings.visitedRooms?.[id] && lastRoomIdRef.current !== id) {
          console.log(`✅ Player entered room: ${id}`);
          markRoomVisited(id);
        }
        lastRoomIdRef.current = id;
        break; // Exit early if we found the room
      }
    }
    
    // If player is not in any room, clear the last room reference
    if (!foundRoom) {
      lastRoomIdRef.current = null;
    }

  }, 300);

  useFrame(({ camera }) => {
    const pos = [camera.position.x, camera.position.y, camera.position.z];
    throttledUpdate(pos);
  });

  return null;
}

export default PlayerTracker;