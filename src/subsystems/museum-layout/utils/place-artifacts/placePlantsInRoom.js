export function placePlantsInRoom(roomWidth, roomDepth) {
  const positions = [];
  const tileSize = 1;
  const y = 0;

  // Corner tiles (0-indexed)
  const cornerTiles = [
    [0.5, 0.5],                               // Southwest corner tile center
    [roomWidth - 1.5, 0.5],                   // Southeast corner tile center
    [0.5, roomDepth - 1.5],                   // Northwest corner tile center
    [roomWidth - 1.5, roomDepth - 1.5],       // Northeast corner tile center
  ];

  for (const [tileX, tileZ] of cornerTiles) {
    if (Math.random() < 2 / 3) {
      // Calculate position at center of tile, with room centered at origin
      const x = (tileX - (roomWidth - 1) / 2) * tileSize;
      const z = (tileZ - (roomDepth - 1) / 2) * tileSize;
      positions.push([x, y, z]);
    }
  }

  return positions;
}