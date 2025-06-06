// src/hooks/useRoomVisitTracker.js
import { useEffect } from 'react';
import { useSettings } from '../../ui-overlay/SettingsContext';

export function useRoomVisitTracker(roomData, roomPositions) {
  const { settings, markRoomVisited } = useSettings();
  const playerPos = settings.playerPosition;

  useEffect(() => {
    if (!playerPos || !roomPositions?.length || !roomData?.length) return;

    roomData.forEach((room, index) => {
      const roomId = room.id ?? index; // fallback to index if no ID
      const { width, depth } = room.dimensions;
      const pos = roomPositions[index];
      if (!pos) return;

      const roomMinX = pos.x;
      const roomMaxX = pos.x + width;
      const roomMinZ = pos.z;
      const roomMaxZ = pos.z + depth;

      const px = playerPos[0];
      const pz = playerPos[2];

      const isInside =
        px >= roomMinX &&
        px <= roomMaxX &&
        pz >= roomMinZ &&
        pz <= roomMaxZ;

      if (isInside && !settings.visitedRooms[roomId]) {
        markRoomVisited(roomId);
      }
    });
  }, [playerPos, roomData, roomPositions, settings.visitedRooms, markRoomVisited]);
}
