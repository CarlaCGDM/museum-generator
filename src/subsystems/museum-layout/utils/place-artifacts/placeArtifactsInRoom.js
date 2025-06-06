import { placeWallArtifacts } from './placeWallArtifacts.js';
import { placeCenterArtifacts } from './placeCenterArtifacts.js';

export function placeArtifactsInRoom(groupedArtifacts, roomWidth, roomDepth, doorTiles) {
  const wallTileSize = 1;
  const wallLengthTiles = {
    north: Math.floor(roomWidth / wallTileSize),
    south: Math.floor(roomWidth / wallTileSize),
    east: Math.floor(roomDepth / wallTileSize),
    west: Math.floor(roomDepth / wallTileSize),
  };

  // Initialize occupied wall tiles and blacklist doors
  const occupiedWallTiles = {
    north: new Array(wallLengthTiles.north).fill(false),
    south: new Array(wallLengthTiles.south).fill(false),
    east: new Array(wallLengthTiles.east).fill(false),
    west: new Array(wallLengthTiles.west).fill(false),
  };

  // First, blacklist corner tiles (corners are unusable for wall placement)
  // North wall corners
  occupiedWallTiles.north[0] = true; // Northwest corner
  occupiedWallTiles.north[wallLengthTiles.north - 1] = true; // Northeast corner
  // South wall corners  
  occupiedWallTiles.south[0] = true; // Southwest corner
  occupiedWallTiles.south[wallLengthTiles.south - 1] = true; // Southeast corner
  // East wall corners
  occupiedWallTiles.east[0] = true; // Northeast corner
  occupiedWallTiles.east[wallLengthTiles.east - 1] = true; // Southeast corner
  // West wall corners
  occupiedWallTiles.west[0] = true; // Northwest corner
  occupiedWallTiles.west[wallLengthTiles.west - 1] = true; // Southwest corner

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

      // Block the door tile itself
      occupiedWallTiles[wall][index] = true;
      
      // Block 1 tile on each side of door (existing logic)
      if (index > 0) occupiedWallTiles[wall][index - 1] = true;
      if (index < occupiedWallTiles[wall].length - 1) occupiedWallTiles[wall][index + 1] = true;

      // Block 2 tiles to the left of the door (from perspective of walking through)
      // This is where the room labels will go
      let leftIndex1, leftIndex2;
      
      if (wall === 'north') {
        // Walking south through north wall, left is east (positive x direction)
        leftIndex1 = index + 4;
        leftIndex2 = index + 5;
      } else if (wall === 'south') {
        // Walking north through south wall, left is west (negative x direction) 
        leftIndex1 = index - 4;
        leftIndex2 = index - 5;
      } else if (wall === 'east') {
        // Walking west through east wall, left is north (negative z direction)
        leftIndex1 = index + 4;
        leftIndex2 = index + 5;
      } else if (wall === 'west') {
        // Walking east through west wall, left is south (positive z direction)
        leftIndex1 = index - 4;
        leftIndex2 = index - 5;
      }

      // Block the label tiles if they're within bounds
      if (leftIndex1 >= 0 && leftIndex1 < occupiedWallTiles[wall].length) {
        occupiedWallTiles[wall][leftIndex1] = true;
      }
      if (leftIndex2 >= 0 && leftIndex2 < occupiedWallTiles[wall].length) {
        occupiedWallTiles[wall][leftIndex2] = true;
      }
    });
  }

  // NEW: Separate starred and non-starred groups (instead of wall vs floor)
  const nonStarredGroups = groupedArtifacts.filter(group => 
    !group.some(item => item.starred)
  );
  const starredGroups = groupedArtifacts.filter(group => 
    group.some(item => item.starred)
  );

  // Place ALL non-starred artifacts against walls using existing wall placement logic
  const placedWalls = placeWallArtifacts(nonStarredGroups, occupiedWallTiles, roomWidth, roomDepth);

  // Place starred artifacts in the center
  const placedCenter = placeCenterArtifacts(starredGroups, roomWidth, roomDepth);

  // Return both wall and center placements
  return [...placedWalls, ...placedCenter];
}