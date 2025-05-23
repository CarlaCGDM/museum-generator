export const computeDoorTiles = (fromWidth, fromDepth, toWidth, toDepth, direction, needsCorrection, logger = () => {}) => {
  const doors = {
    from: [],
    to: [],
  };

  if (direction === 'north' || direction === 'south') {
    // For north/south connections, adjust the x position of doors to match
    // We need to handle odd/even parity differences
    
    // Calculate the center position for the doors - ensure integers for 'from' doors
    const fromStartX = Math.floor(fromWidth / 2) - 1; // Center 3 tiles in first room
    
    // For the 'to' room, adjust center position based on parity
    let toStartX;
    if (needsCorrection) {
      // If odd/even parity difference, we adjust to ensure integer coordinates
      // For odd widths connecting to even widths, we need to shift the center slightly
      toStartX = Math.floor(toWidth / 2) - (toWidth % 2 === 0 ? 1 : 0.5);
    } else {
      // No correction needed, just use normal calculation
      toStartX = Math.floor(toWidth / 2) - 1;
    }
    
    for (let i = 0; i < 3; i++) {
      // The from room's door position
      doors.from.push({ 
        x: Math.round(fromStartX + i), 
        z: direction === 'north' ? 0 : fromDepth - 1 
      });

      // The to room's door - ensure integer coordinates by rounding
      doors.to.push({ 
        x: Math.round(toStartX + i), 
        z: direction === 'north' ? toDepth - 1 : 0 
      });
    }
  } else if (direction === 'east' || direction === 'west') {
    // For east/west connections, adjust the z position of doors to match
    const fromStartZ = Math.floor(fromDepth / 2) - 1; // Center 3 tiles
    
    // For the 'to' room, adjust center position based on parity
    let toStartZ;
    if (needsCorrection) {
      // If odd/even parity difference, adjust for integer coordinates
      toStartZ = Math.floor(toDepth / 2) - (toDepth % 2 === 0 ? 1 : 0.5);
    } else {
      // No correction needed
      toStartZ = Math.floor(toDepth / 2) - 1;
    }
    
    for (let i = 0; i < 3; i++) {
      // The from room's door
      doors.from.push({ 
        x: direction === 'east' ? fromWidth - 1 : 0, 
        z: Math.round(fromStartZ + i)
      });

      // The to room's door - ensure integer coordinates
      doors.to.push({ 
        x: direction === 'east' ? 0 : toWidth - 1, 
        z: Math.round(toStartZ + i)
      });
    }
  }

  // Debug logs
  logger(`Door calculation:
    Direction: ${direction}
    Needs parity correction: ${needsCorrection} 
    FromDoor tiles: ${JSON.stringify(doors.from)}
    ToDoor tiles: ${JSON.stringify(doors.to)}
    All coordinates are integers: ${doors.from.every(d => Number.isInteger(d.x) && Number.isInteger(d.z)) && 
                                    doors.to.every(d => Number.isInteger(d.x) && Number.isInteger(d.z))}`);

  return doors;
};