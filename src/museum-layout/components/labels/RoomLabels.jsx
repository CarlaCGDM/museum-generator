import React from 'react';
import ExitDoorLabel from './ExitDoorLabel';
import FloorLabel from './FloorLabel';
import EntranceDoorLabel from './EntranceDoorLabel';

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
  currentRoomInfo,
  doorTiles = [], // This represents the entrance door tiles in current room coordinates
}) => {

  //console.log("currentRoomInfo",currentRoomInfo)
  const currentRoomColor = currentRoomInfo ? getTopicColor(currentRoomInfo.topicId) : null;
  const nextRoomColor = nextRoomInfo ? getTopicColor(nextRoomInfo.topicId) : null;

  let exitDoorLabel = null;
  let entranceDoorLabel = null;

  // Exit door (next room) - uses nextRoomInfo.doorTiles
  if (nextRoomInfo) {
    const exitDoorTiles = nextRoomInfo.doorTiles;
    const wall = getWallFromDoorTiles(exitDoorTiles, width, depth);
    if (wall) {
      const midTile = exitDoorTiles[Math.floor(exitDoorTiles.length / 2)];
      const rotationY = WALL_ROTATIONS[wall];
      const [offsetX, , offsetZ] = WALL_OFFSETS[wall];

      const labelPosition = [
        xOffset + midTile.x * tileSize + offsetX,
        2.5,
        zOffset + midTile.z * tileSize + offsetZ,
      ];

      exitDoorLabel = (
        <ExitDoorLabel
          key="exit-door-label"
          position={labelPosition}
          rotationY={rotationY}
          topicColor={nextRoomColor}
          {...nextRoomInfo}
        />
      );
    }
  }

  // Entrance door (current room) - uses doorTiles prop (not currentRoomInfo.doorTiles)
  if (currentRoomInfo) {
    const entranceDoorTiles = currentRoomInfo.doorTiles; // Use the doorTiles prop, not currentRoomInfo.doorTiles
    const wall = getWallFromDoorTiles(entranceDoorTiles, width, depth);
    if (wall) {
      const midTile = entranceDoorTiles[Math.floor(entranceDoorTiles.length / 2)];
      const rotationY = WALL_ROTATIONS[wall];
      const [offsetX, , offsetZ] = WALL_OFFSETS[wall];

      const labelPosition = [
        xOffset + midTile.x * tileSize + offsetX,
        2.5,
        zOffset + midTile.z * tileSize + offsetZ,
      ];

      entranceDoorLabel = (
        <EntranceDoorLabel
          key="entrance-door-label"
          position={labelPosition}
          rotationY={rotationY}
          topicColor={currentRoomColor}
          {...currentRoomInfo}
        />
      );
    }
  }

  return (
    <group>
      {exitDoorLabel}
      {entranceDoorLabel}
      <FloorLabel
        width={width}
        depth={depth}
        tileSize={tileSize}
        xOffset={xOffset}
        zOffset={zOffset}
        entranceDoorTiles={doorTiles} // Also updated this to use doorTiles prop
        exitDoorTiles={nextRoomInfo?.doorTiles || []}
        doorTiles
        currentRoomColor={currentRoomColor}
        nextRoomColor={nextRoomColor}
      />
    </group>
  );
};

export default RoomLabels;