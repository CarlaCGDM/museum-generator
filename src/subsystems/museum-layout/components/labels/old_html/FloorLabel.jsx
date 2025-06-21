import React from 'react';
import { Html } from '@react-three/drei';
import { ArrowUp, Check } from 'lucide-react';

const FloorLabel = ({
  width,
  depth,
  tileSize,
  xOffset,
  zOffset,
  currentRoomColor = 'pink',
  nextRoomColor = null,
  roomDoorInfoEntry = {},
  occlude,
}) => {
  const {
    entranceRotation = 0,
    exitRotation = 0,
    entranceTiles = [],
    exitTiles = [],
  } = roomDoorInfoEntry;

  const hasDoors = (entranceTiles?.length || exitTiles?.length);
  if (!hasDoors) return null;

  const roomCenterX = xOffset + (width * tileSize) / 2 - tileSize / 2;
  const roomCenterZ = zOffset + (depth * tileSize) / 2 - tileSize / 2;

  const labelPos = { x: roomCenterX, z: roomCenterZ };
  const exitMidPos = exitTiles.length > 0
    ? {
      x: xOffset + exitTiles[Math.floor(exitTiles.length / 2)].x * tileSize,
      z: zOffset + exitTiles[Math.floor(exitTiles.length / 2)].z * tileSize,
    }
    : null;

  const computedExitRotation = exitMidPos
    ? Math.atan2(exitMidPos.x - labelPos.x, -(exitMidPos.z - labelPos.z))
    : 0;


  const circleStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: nextRoomColor ?? currentRoomColor,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'default',
    transform: 'scale(4)',
  };

  return (
    <group position={[roomCenterX, 0.05, roomCenterZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <Html
        distanceFactor={10}
        transform
        scale={0.25}
        center
        style={{ pointerEvents: 'none' }}
        zIndexRange={[100, 0]}
        occlude={occlude}
      >
        <div style={circleStyle}>
          {nextRoomColor ? (
            <ArrowUp
              size={24}
              strokeWidth={3}
              color="white"
              style={{ transform: `rotate(${computedExitRotation}rad)` }}
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
    </group>
  );
};

export default FloorLabel;
