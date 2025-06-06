export function findAllFreeWallTiles(wallArray, lengthNeeded) {
  const freeIndices = [];
  const wallLength = wallArray.length;
  let consecutive = 0;

  for (let i = 0; i < wallLength; i++) {
    if (!wallArray[i]) {
      consecutive++;
      if (consecutive >= lengthNeeded) {
        const startIndex = i - lengthNeeded + 1;
        const endIndex = startIndex + lengthNeeded - 1;

        if (startIndex === 0) continue; // exclude corner start
        if (endIndex === wallLength - 1) continue; // exclude corner end

        freeIndices.push(startIndex);
      }
    } else {
      consecutive = 0;
    }
  }

  return freeIndices;
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function getEntryWallDirection(doorTiles, roomWidth, roomDepth) {
  for (const { x, z } of doorTiles) {
    if (z === 0) return 'north';
    if (z === roomDepth - 1) return 'south';
    if (x === 0) return 'west';
    if (x === roomWidth - 1) return 'east';
  }
  return null;
}
