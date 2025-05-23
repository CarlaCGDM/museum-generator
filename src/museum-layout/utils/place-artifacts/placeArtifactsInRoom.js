import { placeWallArtifacts } from './placeWallArtifacts.js';
import { shuffleArray, findAllFreeWallTiles, getEntryWallDirection } from './utils.js';
import { getCorridorTiles } from './getCorridorTiles.js'; // Your corridor detection function
import { placeInnerRingArtifacts } from './placeInnerRingArtifacts.js'; // Your new function to place on inner ring

export function placeArtifactsInRoom(groupedArtifacts, roomWidth, roomDepth, doorTiles) {
  const wallTileSize = 1;
  const wallLengthTiles = {
    north: Math.floor(roomWidth / wallTileSize),
    south: Math.floor(roomWidth / wallTileSize),
    east: Math.floor(roomDepth / wallTileSize),
    west: Math.floor(roomDepth / wallTileSize),
  };

  // Initialize occupied wall tiles and blacklist doors (same as before)
  const occupiedWallTiles = {
    north: new Array(wallLengthTiles.north).fill(false),
    south: new Array(wallLengthTiles.south).fill(false),
    east: new Array(wallLengthTiles.east).fill(false),
    west: new Array(wallLengthTiles.west).fill(false),
  };

  if (doorTiles && Array.isArray(doorTiles)) {
    doorTiles.forEach(({ x, z }) => {
      let wall, index;

      if (z === 0) {
        wall = 'north';
        index = x;
      } else if (z === roomDepth - 1) {
        wall = 'south';
        index = x;
      } else if (x === 0) {
        wall = 'west';
        index = z;
      } else if (x === roomWidth - 1) {
        wall = 'east';
        index = z;
      } else {
        return;
      }

      if (!occupiedWallTiles[wall]) return;

      occupiedWallTiles[wall][index] = true;
      if (index > 0) occupiedWallTiles[wall][index - 1] = true;
      if (index < occupiedWallTiles[wall].length - 1) occupiedWallTiles[wall][index + 1] = true;
    });
  }

  // Separate wall and floor groups
  const wallGroups = groupedArtifacts.filter(group => group.every(item => item.onWall));
  const floorGroups = groupedArtifacts.filter(group => !group.every(item => item.onWall));

  // Place wall artifacts (no change)
  const placedWalls = placeWallArtifacts(wallGroups, occupiedWallTiles, roomWidth, roomDepth);

  // Compute corridor tiles to avoid
  const corridorTileSet = getCorridorTiles(doorTiles, roomWidth, roomDepth);

  // Place floor artifacts ONLY on the inner ring for now
  const placedFloorRing = placeInnerRingArtifacts(floorGroups, roomWidth, roomDepth, corridorTileSet);

  // Return only walls + floor on the ring (skip any other floor placement for now)
  return [...placedWalls, ...placedFloorRing];
}
