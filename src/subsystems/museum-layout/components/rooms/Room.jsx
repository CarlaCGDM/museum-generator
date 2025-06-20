// Room.jsx
import React from 'react';
import { useDebug } from '../../../debug/DebugContext';
import RoomLabels from '../labels/RoomLabels';
import RoomTiles from './RoomTiles';
import RoomDebugOverlays from './RoomDebugOverlays';
import { useSettings } from '../../../ui-overlay/SettingsContext';


const Room = ({
  width = 5,
  depth = 6,
  tileSize = 1,
  position = [0, 0, 0],
  doorTiles = [],
  interiorWallTiles = { tiles: [], oppositeSideTiles: [] },
  nextRoomInfo = null,
  index = 0,
  wallHeight = 4,
  currentRoomInfo,
  roomDoorInfo, // Add this prop
}) => {
  const showIndexes = useDebug('Room', 'Indexes');
  const showDirections = useDebug('Room', 'Directions');

  const xOffset = -((width * tileSize) / 2) + tileSize / 2;
  const zOffset = -((depth * tileSize) / 2) + tileSize / 2;

  const { settings } = useSettings();
  const isPlayerInThisRoom = settings.currentRoomIndex === index;

  return (
    <group position={position}>
      {isPlayerInThisRoom && (
        <RoomLabels
          width={width}
          depth={depth}
          tileSize={tileSize}
          xOffset={xOffset}
          zOffset={zOffset}
          doorTiles={doorTiles}
          currentRoomInfo={currentRoomInfo}
          nextRoomInfo={nextRoomInfo}
          roomDoorInfo={roomDoorInfo} // Pass the door info
          roomIndex={index}          // Pass the room index
        />
      )}

      <group position={[xOffset, 0, zOffset]}>
        <RoomTiles
          width={width}
          depth={depth}
          tileSize={tileSize}
          xOffset={xOffset}
          zOffset={zOffset}
          position={position}
          doorTiles={doorTiles}
          interiorWallTiles={interiorWallTiles}
          roomIndex={index} // ✅ Add this line
        />
      </group>

      <RoomDebugOverlays
        width={width}
        depth={depth}
        tileSize={tileSize}
        index={index}
        showDirections={showDirections}
        showIndexes={showIndexes}
      />
    </group>
  );
};

export default Room;