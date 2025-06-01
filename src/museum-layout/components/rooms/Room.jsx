// Room.jsx
import React from 'react';
import { useDebug } from '../../../debug/DebugContext';
import RoomLabels from '../labels/RoomLabels';
import RoomTiles from './RoomTiles';
import RoomOcclusionWalls from './RoomOcclusionWalls';
import RoomDebugOverlays from './RoomDebugOverlays';

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
  currentRoomTopicId, // Add this prop to identify current room's topic
}) => {
  const showIndexes = useDebug('Room', 'Indexes');
  const showDirections = useDebug('Room', 'Directions');

  const xOffset = -((width * tileSize) / 2) + tileSize / 2;
  const zOffset = -((depth * tileSize) / 2) + tileSize / 2;

  return (
    <group position={position}>
      <RoomOcclusionWalls
        width={width}
        depth={depth}
        tileSize={tileSize}
        wallHeight={wallHeight}
      />

      <RoomLabels
        width={width}
        depth={depth}
        tileSize={tileSize}
        xOffset={xOffset}
        zOffset={zOffset}
        nextRoomInfo={nextRoomInfo}
        doorTiles={doorTiles} // entrance door tiles
        currentRoomTopicId={currentRoomTopicId} // current room's topic ID
      />

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