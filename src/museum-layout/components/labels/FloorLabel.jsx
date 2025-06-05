import React from 'react';
import { Html } from '@react-three/drei';
import { ArrowUp, Check } from 'lucide-react';

const FloorLabel = ({
  width,
  depth,
  tileSize,
  xOffset,
  zOffset,
  entranceDoorTiles = [],
  exitDoorTiles = [],
  currentRoomColor = 'pink',
  nextRoomColor = null,
  doorTiles,
}) => {

  console.log("EntranceDoor",entranceDoorTiles)
  console.log("ExitDoor",exitDoorTiles)
  console.log("Currentroomcolor",currentRoomColor)
  if (doorTiles.length === 0 && exitDoorTiles.length === 0) {
    return null;
  }

  const roomCenterX = xOffset + (width * tileSize) / 2 - tileSize / 2;
  const roomCenterZ = zOffset + (depth * tileSize) / 2 - tileSize / 2;

  // Calculate exit door position (default to center if no exit)
  let exitX = roomCenterX;
  let exitZ = roomCenterZ;
  if (exitDoorTiles.length > 0) {
    const exitMidTile = exitDoorTiles[Math.floor(exitDoorTiles.length / 2)];
    exitX = xOffset + exitMidTile.x * tileSize;
    exitZ = zOffset + exitMidTile.z * tileSize;
  }

  // Calculate entrance door position (default to center if no entrance)
  let entranceX = roomCenterX;
  let entranceZ = roomCenterZ;
  if (entranceDoorTiles.length > 0) {
    const entranceMidTile = entranceDoorTiles[Math.floor(entranceDoorTiles.length / 2)];
    entranceX = xOffset + entranceMidTile.x * tileSize;
    entranceZ = zOffset + entranceMidTile.z * tileSize;
  }

  // Rotation towards exit door
  const deltaExitX = exitX - roomCenterX;
  const deltaExitZ = exitZ - roomCenterZ;
  const exitRotation = Math.atan2(deltaExitX, -deltaExitZ);

  // Rotation towards entrance door (for last room checkmark)
  const deltaEntranceX = entranceX - roomCenterX;
  const deltaEntranceZ = entranceZ - roomCenterZ;
  const entranceRotation = Math.atan2(deltaEntranceX, -deltaEntranceZ);

  const circleStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: nextRoomColor ? nextRoomColor : currentRoomColor,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'default',
    transform: 'scale(4)',
  };

   const stripeStyle = {
    width: '2px',
    height: '200px',
    backgroundColor: nextRoomColor ? nextRoomColor : currentRoomColor,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'default',
  };

  const distance = Math.sqrt(deltaExitX * deltaExitX + deltaExitZ * deltaExitZ);
  const circleRadius = 24; // circle radius in pixels (since circle is 48px wide)
  const gap = 4; // small gap between circle edge and stripe start
  const stripeLength = distance - circleRadius - gap;

  return (
    <group position={[roomCenterX, 0.05, roomCenterZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <Html
        distanceFactor={10}
        transform
        scale={0.25}
        center
        style={{ pointerEvents: 'none' }}
        zIndexRange={[100, 0]}
        occlude
      >
        <div style={circleStyle}>
          {nextRoomColor ? (
            <ArrowUp
              size={24}
              strokeWidth={3}
              color="white"
              style={{ transform: `rotate(${exitRotation}rad)` }}
            />
          ) : (
            <Check
              size={24}
              strokeWidth={3}
              color="white"
              style={{ transform: `rotate(${-entranceRotation}rad)` }}
            />
          )}
        </div>
      </Html>
      {/* <Html
        distanceFactor={10}
        transform
        occlude
        style={{ pointerEvents: 'none' }}
      >
        <div style={stripeStyle}>
          
        </div>
      </Html> */}
    </group>
  );
};

export default FloorLabel;
