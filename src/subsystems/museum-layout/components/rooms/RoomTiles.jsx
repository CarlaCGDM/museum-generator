import React from 'react';
import FloorTilesInstanced from '../tileset/instances/FloorTilesInstanced';
import WallTilesInstanced from '../tileset/instances/WallTilesInstanced';
import CornerTilesInstanced from '../tileset/instances/CornerTilesInstanced';
import DoorTilesInstanced from '../tileset/instances/DoorTilesInstanced';

const RoomTiles = ({
  width,
  depth,
  tileSize,
  xOffset,
  zOffset,
  position,
  doorTiles,
  interiorWallTiles,
  roomIndex,
}) => {
  const isMatch = (arr, x, z) => Array.isArray(arr) && arr.some(t => t.x === x && t.z === z);
  const isEdge = (x, z) => x === 0 || z === 0 || x === width - 1 || z === depth - 1;
  const isCorner = (x, z) => (x === 0 || x === width - 1) && (z === 0 || z === depth - 1);

  const getCornerDirection = (x, z) => {
    if (x === 0 && z === 0) return 'north';
    if (x === width - 1 && z === 0) return 'east';
    if (x === 0 && z === depth - 1) return 'west';
    if (x === width - 1 && z === depth - 1) return 'south';
    return 'north';
  };

  const getDirection = (x, z) => {
    if (isCorner(x, z)) return getCornerDirection(x, z);
    if (z === 0) return 'north';
    if (z === depth - 1) return 'south';
    if (x === 0) return 'west';
    if (x === width - 1) return 'east';
    return 'north';
  };

  const floorTilePositions = [];
  const wallTilePositions = [];
  const wallTileDirections = [];
  const cornerTilePositions = [];
  const cornerTileDirections = [];
  const doorTilePositions = [];
  const doorTileDirections = [];

  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      let type = 'floor';
      let direction = getDirection(x, z);

      const matchedInterior = interiorWallTiles?.tiles?.find(t => t.x === x && t.z === z);
      const matchedOpposite = interiorWallTiles?.oppositeSideTiles?.find(t => t.x === x && t.z === z);

      if (isMatch(doorTiles, x, z)) {
        type = 'door';
      } else if (matchedInterior) {
        type = 'interiorWall';
        direction = matchedInterior.direction;
      } else if (matchedOpposite) {
        type = 'interiorWall';
        direction = matchedOpposite.direction;
      } else if (isCorner(x, z)) {
        type = 'corner';
        direction = getCornerDirection(x, z);
      } else if (isEdge(x, z)) {
        type = 'wall';
      }

      const localX = x * tileSize;
      const localZ = z * tileSize;

      switch (type) {
        case 'floor':
          floorTilePositions.push([localX, 0, localZ]);
          break;
        case 'wall':
          wallTilePositions.push([localX, 0, localZ]);
          wallTileDirections.push(direction);
          break;
        case 'corner':
          cornerTilePositions.push([localX, 0, localZ]);
          cornerTileDirections.push(direction);
          break;
        case 'door':
          doorTilePositions.push([localX, 0, localZ]);
          doorTileDirections.push(direction);
          break;
        default:
          break;
      }
    }
  }

  return (
    <>
      <FloorTilesInstanced
        positions={floorTilePositions}
        tileSize={tileSize}
        roomPosition={position}
        innerGroupOffset={[xOffset, 0, zOffset]}
        roomIndex={roomIndex}
      />

      <WallTilesInstanced
        positions={wallTilePositions}
        directions={wallTileDirections}
        tileSize={tileSize}
        roomPosition={position}
        innerGroupOffset={[xOffset, 0, zOffset]}
        roomIndex={roomIndex}
      />

      <CornerTilesInstanced
        positions={cornerTilePositions}
        directions={cornerTileDirections}
        tileSize={tileSize}
        roomPosition={position}
        innerGroupOffset={[xOffset, 0, zOffset]}
        roomIndex={roomIndex}
      />

      <DoorTilesInstanced
        positions={doorTilePositions}
        directions={doorTileDirections}
        tileSize={tileSize}
        roomPosition={position}
        innerGroupOffset={[xOffset, 0, zOffset]}
        roomIndex={roomIndex}
      />
    </>
  );
};

export default RoomTiles;
