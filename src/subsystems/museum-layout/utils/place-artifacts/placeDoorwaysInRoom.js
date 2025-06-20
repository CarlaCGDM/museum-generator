export function placeDoorwaysInRoom(allDoorTiles, entranceTiles, exitTiles, tileSize = 1, roomWidth = 1, roomDepth = 1) {
  // Stable sorting to prevent reload inconsistencies
  const sortedDoors = [...allDoorTiles].sort((a, b) => a.x - b.x || a.z - b.z);
  const doorGroups = [];

  for (let i = 0; i < sortedDoors.length; i += 3) {
    const group = sortedDoors.slice(i, i + 3);
    if (group.length !== 3) continue;

    const middleTile = group[1];
    
    // Determine which wall this door is on
    const wallPosition = 
      middleTile.x === 0 ? 'west' :
      middleTile.x === roomWidth - 1 ? 'east' :
      middleTile.z === 0 ? 'south' : 
      middleTile.z === roomDepth - 1 ? 'north' : 
      null;

    if (!wallPosition) continue;

    // Simple direction assignment based on wall position
    // Each door faces INTO the room it's connecting to
    let direction;
    
    switch (wallPosition) {
      case 'north':
        direction = 'north';  // Door on north wall faces north (out of room)
        break;
      case 'south':
        direction = 'south';  // Door on south wall faces south (out of room)
        break;
      case 'east':
        direction = 'east';   // Door on east wall faces east (out of room)
        break;
      case 'west':
        direction = 'west';   // Door on west wall faces west (out of room)
        break;
    }

    doorGroups.push({
      id: `${middleTile.x}-${middleTile.z}`,
      position: [
        -((roomWidth * tileSize) / 2) + tileSize / 2 + middleTile.x * tileSize,
        0,
        -((roomDepth * tileSize) / 2) + tileSize / 2 + middleTile.z * tileSize,
      ],
      direction
    });
  }

  return doorGroups;
}