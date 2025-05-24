import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useDebug } from '../../debug/DebugContext';

import FloorTile from './tileset/FloorTile';
import WallTile from './tileset/WallTile';
import CornerTile from './tileset/CornerTile';
import DoorTile from './tileset/DoorTile';
import InteriorWallTile from './tileset/InteriorWallTile';

const Tile = ({
  x = 0,
  z = 0,
  tileSize = 1,
  type = 'floor', // 'floor', 'wall', 'door', 'interiorWall', 'corner'
  direction = 'north', // rotation
}) => {
  const showTileIndexes = useDebug('Tile', 'Indexes');

  const position = [x * tileSize, 0, z * tileSize];

  const rotationY = useMemo(() => {
    switch (direction) {
      case 'east': return -Math.PI / 2;
      case 'south': return Math.PI;
      case 'west': return Math.PI / 2;
      default: return 0;
    }
  }, [direction]);

  const TileComponent = useMemo(() => {
    switch (type) {
      case 'wall': return WallTile;
      case 'door': return DoorTile;
      case 'interiorWall': return InteriorWallTile;
      case 'corner': return CornerTile;
      case 'floor':
      default:
        return FloorTile;
    }
  }, [type]);

  return (
    <group position={position}>
      <group rotation={[0, rotationY, 0]}>
        <TileComponent tileSize={tileSize} />
      </group>

      {showTileIndexes && (
        <Html position={[0, 0.06, 0]} center distanceFactor={10} style={labelStyle}>
          <div>{`(${x}, ${z})`}</div>
        </Html>
      )}
    </group>
  );
};

const labelStyle = {
  pointerEvents: 'none',
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'red',
  width: '100px',
  textAlign: 'center',
};

export default Tile;
