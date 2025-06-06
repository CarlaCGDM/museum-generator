export const markTiles = (occupiedTiles, pos, width, depth, tileSize = 1) => {
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      const globalX = Math.round(pos.x + (x - width / 2 + 0.5) * tileSize);
      const globalZ = Math.round(pos.z + (z - depth / 2 + 0.5) * tileSize);
      occupiedTiles.add(`${globalX},${globalZ}`);
    }
  }
};

export const wouldOverlap = (occupiedTiles, pos, width, depth, tileSize = 1) => {
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      const globalX = Math.round(pos.x + (x - width / 2 + 0.5) * tileSize);
      const globalZ = Math.round(pos.z + (z - depth / 2 + 0.5) * tileSize);
      if (occupiedTiles.has(`${globalX},${globalZ}`)) {
        return true;
      }
    }
  }
  return false;
};
