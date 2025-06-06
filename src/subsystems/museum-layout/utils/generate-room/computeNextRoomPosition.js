export const computeNextRoomPosition = (
  fromPos, fromWidth, fromDepth, toWidth, toDepth, direction, tileSize
) => {
  let pos;

  switch (direction) {
    case 'north':
      pos = {
        x: fromPos.x,
        z: fromPos.z - (fromDepth / 2 + toDepth / 2) * tileSize
      };
      break;
    case 'east':
      pos = {
        x: fromPos.x + (fromWidth / 2 + toWidth / 2) * tileSize,
        z: fromPos.z
      };
      break;
    case 'south':
      pos = {
        x: fromPos.x,
        z: fromPos.z + (fromDepth / 2 + toDepth / 2) * tileSize
      };
      break;
    case 'west':
      pos = {
        x: fromPos.x - (fromWidth / 2 + toWidth / 2) * tileSize,
        z: fromPos.z
      };
      break;
  }

  let needsOffsetCorrection = false;

  if (direction === 'north' || direction === 'south') {
    needsOffsetCorrection = (fromWidth % 2) !== (toWidth % 2);
  } else {
    needsOffsetCorrection = (fromDepth % 2) !== (toDepth % 2);
  }

  const logs = [];

  logs.push(`Compute connection:
  FROM (width=${fromWidth}, depth=${fromDepth})
  TO   (width=${toWidth}, depth=${toDepth})
  Direction: ${direction}
  Needs correction: ${needsOffsetCorrection}
  Before correction: (${pos.x}, ${pos.z})
  `);

  if (needsOffsetCorrection) {
    if (direction === 'north' || direction === 'south') {
      pos.x -= tileSize / 2;
    } else {
      pos.z -= tileSize / 2;
    }
  }

  logs.push(`After correction: (${pos.x}, ${pos.z})`);

  return {
    position: pos,
    needsCorrection: needsOffsetCorrection,
    debugLogs: logs,
  };
};
