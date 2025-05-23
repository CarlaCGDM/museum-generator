export const computeInteriorWallTiles = (width, depth, minSize = 5, logger = () => {}) => {
  const tiles = [];
  const oppositeSideTiles = [];

  const longestDim = Math.max(width, depth);
  logger(`Checking room size (${width}x${depth}), longest dimension = ${longestDim}`);

  if (longestDim < minSize) {
    logger(`Room too small for interior wall (minSize = ${minSize}). No wall generated.`);
    return { tiles, oppositeSideTiles };
  }

  let wallLength = Math.floor(longestDim * 0.4);

  // Ensure the wall is centerable
  if ((longestDim - wallLength) % 2 !== 0) {
    wallLength += 1;
    logger(`Adjusted wall length to ${wallLength} for even centering`);
  }

  logger(`Generating interior wall of length ${wallLength} for room of size ${width}x${depth}`);

  const getOppositeDirection = (dir) => {
    const opposites = {
      north: 'south',
      south: 'north',
      east: 'west',
      west: 'east',
    };
    return opposites[dir];
  };

  if (width >= depth) {
    // Horizontal wall (along X), centered vertically
    const z = (depth % 2 === 0) ? (depth / 2) - 1 : Math.floor(depth / 2);
    const startX = Math.floor((width - wallLength) / 2);

    for (let x = startX; x < startX + wallLength; x++) {
      tiles.push({ x, z, direction: 'south' });

      const zOpp = z + 1;
      oppositeSideTiles.push({ x, z: zOpp, direction: 'north' });

      logger(`Wall tile: x=${x}, z=${z} (south) | Opposite: z=${zOpp} (north)`);
    }
  } else {
    // Vertical wall (along Z), centered horizontally
    const x = (width % 2 === 0) ? (width / 2) - 1 : Math.floor(width / 2);
    const startZ = Math.floor((depth - wallLength) / 2);

    for (let z = startZ; z < startZ + wallLength; z++) {
      tiles.push({ x, z, direction: 'east' });

      const xOpp = x + 1;
      oppositeSideTiles.push({ x: xOpp, z, direction: 'west' });

      logger(`Wall tile: x=${x}, z=${z} (east) | Opposite: x=${xOpp} (west)`);
    }
  }

  logger({ tiles, oppositeSideTiles });
  return { tiles, oppositeSideTiles };
};
