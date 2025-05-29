import React from 'react';
import Tile from './Tile';
import FloorTilesInstanced from './tileset/instances/FloorTilesInstanced';
import WallTilesInstanced from './tileset/instances/WallTilesInstanced';
import CornerTilesInstanced from './tileset/instances/CornerTilesInstanced';
import DoorTilesInstanced from './tileset/instances/DoorTilesInstanced';
import { Html } from '@react-three/drei';
import { useDebug } from '../../debug/DebugContext';
import DoorLabel from './DoorLabel';

const Room = ({
  width = 5,
  depth = 6,
  tileSize = 1,
  position = [0, 0, 0],
  doorTiles = [],
  interiorWallTiles = { tiles: [], oppositeSideTiles: [] },
  nextRoomInfo = null,
  index = 0,
  wallHeight = 4, // Add wall height prop
}) => {
  const showIndexes = useDebug('Room', 'Indexes');
  const showDirections = useDebug('Room', 'Directions');

  const xOffset = -((width * tileSize) / 2) + tileSize / 2;
  const zOffset = -((depth * tileSize) / 2) + tileSize / 2;

  const isMatch = (arr, x, z) => Array.isArray(arr) && arr.some(t => t.x === x && t.z === z);

  const isEdge = (x, z) =>
    x === 0 || z === 0 || x === width - 1 || z === depth - 1;

  const isCorner = (x, z) =>
    (x === 0 || x === width - 1) && (z === 0 || z === depth - 1);

  const getCornerDirection = (x, z) => {
    if (x === 0 && z === 0) return 'north';         // top-left
    if (x === width - 1 && z === 0) return 'east';  // top-right
    if (x === 0 && z === depth - 1) return 'west';  // bottom-left
    if (x === width - 1 && z === depth - 1) return 'south'; // bottom-right
    return 'north';
  };

  const getDirection = (x, z) => {
    if (isCorner(x, z)) return getCornerDirection(x, z);
    if (z === 0) return 'north';
    if (z === depth - 1) return 'south';
    if (x === 0) return 'west';
    if (x === width - 1) return 'east';
    return 'north';
  };

  const floorTilePositions = [];
  const wallTilePositions = [];
  const wallTileDirections = [];
  const cornerTilePositions = [];
  const cornerTileDirections = [];
  const doorTilePositions = [];
  const doorTileDirections = [];

  // Calculate door labels inside Room component
  const doorLabels = [];
  if (nextRoomInfo) {
    const { doorTiles: doorTilesFrom, name, description } = nextRoomInfo;

    const allX = doorTilesFrom.map(tile => tile.x);
    const allZ = doorTilesFrom.map(tile => tile.z);
    const uniqueX = new Set(allX);
    const uniqueZ = new Set(allZ);

    let wall = null;
    if (uniqueX.size === 1) {
      const x = allX[0];
      wall = x === 0 ? 'west' : (x === width - 1 ? 'east' : null);
    } else if (uniqueZ.size === 1) {
      const z = allZ[0];
      wall = z === 0 ? 'north' : (z === depth - 1 ? 'south' : null);
    }

    if (wall) {
      const midIndex = Math.floor(doorTilesFrom.length / 2);
      const middleTile = doorTilesFrom[midIndex];

      // Use the same coordinate system as your tiles
      let rotationY = 0;
      let labelPos;

      switch (wall) {
        case 'north':
          rotationY = 0;
          labelPos = [
            xOffset + middleTile.x * tileSize + 3.5, // offset to the right (east)
            2.5,
            zOffset + middleTile.z * tileSize
          ];
          break;
        case 'south':
          rotationY = Math.PI;
          labelPos = [
            xOffset + middleTile.x * tileSize - 3.5, // offset to the right (west when facing south)
             2.5,
            zOffset + middleTile.z * tileSize
          ];
          break;
        case 'east':
          rotationY = -Math.PI / 2;
          labelPos = [
            xOffset + middleTile.x * tileSize,
            2.5,
            zOffset + middleTile.z * tileSize + 3.5 // offset to the right (south when facing east)
          ];
          break;
        case 'west':
          rotationY = Math.PI / 2;
          labelPos = [
            xOffset + middleTile.x * tileSize,
            2.5,
            zOffset + middleTile.z * tileSize - 3.5 // offset to the right (north when facing west)
          ];
          break;
      }

      doorLabels.push({
        position: labelPos,
        rotationY,
        name,
        description,
      });
    }
  }

  // Calculate wall dimensions
  const roomWidth = width * tileSize;
  const roomDepth = depth * tileSize;

  return (
    <group position={position}>
      {/* Invisible walls for occlusion */}
      <group>
        {/* North Wall */}
        <mesh position={[0, wallHeight / 2, -roomDepth / 2]} visible={false}>
          <boxGeometry args={[roomWidth, wallHeight, 0.1]} />
          <meshBasicMaterial />
        </mesh>

        {/* South Wall */}
        <mesh position={[0, wallHeight / 2, roomDepth / 2]} visible={false}>
          <boxGeometry args={[roomWidth, wallHeight, 0.1]} />
          <meshBasicMaterial />
        </mesh>

        {/* West Wall */}
        <mesh position={[-roomWidth / 2, wallHeight / 2, 0]} visible={false}>
          <boxGeometry args={[0.1, wallHeight, roomDepth]} />
          <meshBasicMaterial />
        </mesh>

        {/* East Wall */}
        <mesh position={[roomWidth / 2, wallHeight / 2, 0]} visible={false}>
          <boxGeometry args={[0.1, wallHeight, roomDepth]} />
          <meshBasicMaterial />
        </mesh>
      </group>

      {doorLabels.map((label, i) => (
        <DoorLabel
          key={i}
          position={label.position}
          rotationY={label.rotationY}
          name={label.name}
          description={label.description}
        />
      ))}

      <group position={[xOffset, 0, zOffset]}>
        {Array.from({ length: width }).map((_, x) =>
          Array.from({ length: depth }).map((_, z) => {
            let type = 'floor';
            let direction = getDirection(x, z);

            const matchedInteriorTile = interiorWallTiles.tiles.find(t => t.x === x && t.z === z);
            const matchedOppositeTile = interiorWallTiles.oppositeSideTiles.find(t => t.x === x && t.z === z);

            if (isMatch(doorTiles, x, z)) {
              type = 'door';
              direction = getDirection(x, z);
            } else if (matchedInteriorTile) {
              type = 'interiorWall';
              direction = matchedInteriorTile.direction;
            } else if (matchedOppositeTile) {
              type = 'interiorWall';
              direction = matchedOppositeTile.direction;
            } else if (isCorner(x, z)) {
              type = 'corner';
              direction = getCornerDirection(x, z);
            } else if (isEdge(x, z)) {
              type = 'wall';
              direction = getDirection(x, z);
            }

            const localX = x * tileSize;
            const localZ = z * tileSize;

            if (type === 'floor') {
              floorTilePositions.push([localX, 0, localZ]);
              return null;
            } else if (type === 'wall') {
              wallTilePositions.push([localX, 0, localZ]);
              wallTileDirections.push(direction);
              return null;
            } else if (type === 'corner') {
              cornerTilePositions.push([localX, 0, localZ]);
              cornerTileDirections.push(direction);
              return null;
            } else if (type === 'door') {
              doorTilePositions.push([localX, 0, localZ]);
              doorTileDirections.push(direction);
              return null;
            }

            return (
              <Tile
                key={`tile-${x}-${z}`}
                x={x}
                z={z}
                tileSize={tileSize}
                type={type}
                direction={direction}
              />
            );
          })
        )}

        <FloorTilesInstanced
          positions={floorTilePositions}
          tileSize={tileSize}
          roomPosition={position}
          innerGroupOffset={[xOffset, 0, zOffset]}
        />

        <WallTilesInstanced
          positions={wallTilePositions}
          directions={wallTileDirections}
          tileSize={tileSize}
          roomPosition={position}
          innerGroupOffset={[xOffset, 0, zOffset]}
        />

        <CornerTilesInstanced
          positions={cornerTilePositions}
          directions={cornerTileDirections}
          tileSize={tileSize}
          roomPosition={position}
          innerGroupOffset={[xOffset, 0, zOffset]}
        />

        <DoorTilesInstanced
          positions={doorTilePositions}
          directions={doorTileDirections}
          tileSize={tileSize}
          roomPosition={position}
          innerGroupOffset={[xOffset, 0, zOffset]}
        />
      </group>

      {showDirections && (
        <group>
          <Html position={[0, 0, -depth * tileSize / 2 + 2]} center distanceFactor={10} style={labelStyle}><div>N</div></Html>
          <Html position={[0, 0, depth * tileSize / 2 - 2]} center distanceFactor={10} style={labelStyle}><div>S</div></Html>
          <Html position={[-width * tileSize / 2 + 2, 0, 0]} center distanceFactor={10} style={labelStyle}><div>W</div></Html>
          <Html position={[width * tileSize / 2 - 2, 0, 0]} center distanceFactor={10} style={labelStyle}><div>E</div></Html>
        </group>
      )}

      {showIndexes && (
        <Html center distanceFactor={10} style={{
          pointerEvents: 'none',
          fontSize: '100px',
          fontWeight: 'bold',
          color: 'black',
          backgroundColor: 'white',
          padding: '1vh 1vw',
          borderRadius: '1vw',
        }}>
          <div>{index}</div>
        </Html>
      )}
    </group>
  );
};

const labelStyle = {
  pointerEvents: 'none',
  fontSize: '64px',
  fontWeight: 'bold',
  color: 'blue',
};

export default Room;