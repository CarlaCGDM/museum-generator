import { findAllFreeWallTiles, shuffleArray } from './utils.js';

export function placeWallArtifacts(wallGroups, occupiedWallTiles, roomWidth, roomDepth) {
  const wallTileSize = 1;
  const placed = [];

  wallGroups.forEach(group => {
    const totalWidth = group.reduce((sum, item) => sum + item.dimensions.width, 0);
    const tilesNeeded = Math.ceil(totalWidth / wallTileSize);

    const walls = shuffleArray(['north', 'south', 'east', 'west']);
    let placedOnWall = false;

    for (const wall of walls) {
      const freeIndices = findAllFreeWallTiles(occupiedWallTiles[wall], tilesNeeded);
      if (freeIndices.length > 0) {
        const randomIndex = freeIndices[Math.floor(Math.random() * freeIndices.length)];

        // Mark buffer and occupied tiles
        if (randomIndex > 0) occupiedWallTiles[wall][randomIndex - 1] = true;
        for (let t = randomIndex; t < randomIndex + tilesNeeded; t++) {
          occupiedWallTiles[wall][t] = true;
        }
        if (randomIndex + tilesNeeded < occupiedWallTiles[wall].length) {
          occupiedWallTiles[wall][randomIndex + tilesNeeded] = true;
        }

        let posX = 0, posZ = 0, rotationY = 0;
        const maxDepth = Math.max(...group.map(item => item.dimensions.depth));

        switch (wall) {
          case 'north':
            posZ = -roomDepth / 2 + maxDepth / 2;
            posX = -roomWidth / 2 + (randomIndex + tilesNeeded / 2) * wallTileSize;
            rotationY = 0;
            break;
          case 'south':
            posZ = roomDepth / 2 - maxDepth / 2;
            posX = -roomWidth / 2 + (randomIndex + tilesNeeded / 2) * wallTileSize;
            rotationY = Math.PI;
            break;
          case 'east':
            posX = roomWidth / 2 - maxDepth / 2;
            posZ = -roomDepth / 2 + (randomIndex + tilesNeeded / 2) * wallTileSize;
            rotationY = -Math.PI / 2;
            break;
          case 'west':
            posX = -roomWidth / 2 + maxDepth / 2;
            posZ = -roomDepth / 2 + (randomIndex + tilesNeeded / 2) * wallTileSize;
            rotationY = Math.PI / 2;
            break;
        }

        placed.push({
          contents: group,
          position: [posX, 0, posZ],
          rotationY,
          isWall: true,
        });

        placedOnWall = true;
        break;
      }
    }

    if (!placedOnWall) {
      console.warn('Could not place wall group:', group);
    }
  });

  return placed;
}
