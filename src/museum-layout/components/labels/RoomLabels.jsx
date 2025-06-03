// RoomLabels.jsx
import React from 'react';
import DoorLabel from './DoorLabel';
import FloorLabel from './FloorLabel';

const WALL_ROTATIONS = {
  north: 0,
  south: Math.PI,
  east: -Math.PI / 2,
  west: Math.PI / 2,
};

const WALL_OFFSETS = {
  north: [3.5, 0, 0],
  south: [-3.5, 0, 0],
  east: [0, 0, 3.5],
  west: [0, 0, -3.5],
};

// Extracted colors array from DoorLabel
 const topicColors = [
        '#DE9393', '#DC997C', '#ECBF87', '#D0BF6A',
        '#C0C57C', '#A7C585', '#87C7AD', '#76B8BD',
        '#8C9ACA', '#B295CB', '#C691C4'
    ];
function getTopicColor(topicId) {
  const num = parseInt(topicId?.split('-').pop()) || 0;
  return topicColors[num % topicColors.length];
}

function getWallFromDoorTiles(doorTiles, width, depth) {
  const allX = doorTiles.map(t => t.x);
  const allZ = doorTiles.map(t => t.z);

  if (new Set(allX).size === 1) {
    const x = allX[0];
    return x === 0 ? 'west' : (x === width - 1 ? 'east' : null);
  } else if (new Set(allZ).size === 1) {
    const z = allZ[0];
    return z === 0 ? 'north' : (z === depth - 1 ? 'south' : null);
  }

  return null;
}

const RoomLabels = ({ 
  width, 
  depth, 
  tileSize, 
  xOffset, 
  zOffset, 
  nextRoomInfo,
  doorTiles = [], // entrance door tiles for current room
  currentRoomTopicId, // topic ID of current room
}) => {
  const currentRoomColor = currentRoomTopicId ? getTopicColor(currentRoomTopicId) : null;
  const nextRoomColor = nextRoomInfo ? getTopicColor(nextRoomInfo.topicId) : null;

  return (
    <group>
      {/* Door Label */}
      {nextRoomInfo && (
        (() => {
          const { doorTiles: exitDoorTiles, name, topicName, topicId, description } = nextRoomInfo;
          const wall = getWallFromDoorTiles(exitDoorTiles, width, depth);
          if (!wall) return null;

          const midTile = exitDoorTiles[Math.floor(exitDoorTiles.length / 2)];
          const rotationY = WALL_ROTATIONS[wall];
          const [offsetX, , offsetZ] = WALL_OFFSETS[wall];

          const labelPosition = [
            xOffset + midTile.x * tileSize + offsetX,
            2.5,
            zOffset + midTile.z * tileSize + offsetZ,
          ];

          return (
            <DoorLabel
              key="door-label"
              position={labelPosition}
              rotationY={rotationY}
              name={name}
              topicName={topicName}
              topicId={topicId}
              description={description}
              topicColor={getTopicColor(topicId)}
            />
          );
        })()
      )}

      {/* Floor Label */}
      <FloorLabel
        width={width}
        depth={depth}
        tileSize={tileSize}
        xOffset={xOffset}
        zOffset={zOffset}
        entranceDoorTiles={doorTiles}
        exitDoorTiles={nextRoomInfo?.doorTiles || []}
        currentRoomColor={currentRoomColor}
        nextRoomColor={nextRoomColor}
      />
    </group>
  );
};

export default RoomLabels;