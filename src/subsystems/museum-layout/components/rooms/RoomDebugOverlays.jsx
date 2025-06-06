import React from 'react';
import { Html } from '@react-three/drei';

const RoomDebugOverlays = ({
  width,
  depth,
  tileSize,
  index,
  showDirections = false,
  showIndexes = false,
}) => {
  const labelStyle = {
    pointerEvents: 'none',
    fontSize: '64px',
    fontWeight: 'bold',
    color: 'blue',
  };

  const indexLabelStyle = {
    pointerEvents: 'none',
    fontSize: '100px',
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: 'white',
    padding: '1vh 1vw',
    borderRadius: '1vw',
  };

  return (
    <>
      {showDirections && (
        <group>
          <Html position={[0, 0, -depth * tileSize / 2 + 2]} center distanceFactor={10} style={labelStyle}><div>N</div></Html>
          <Html position={[0, 0, depth * tileSize / 2 - 2]} center distanceFactor={10} style={labelStyle}><div>S</div></Html>
          <Html position={[-width * tileSize / 2 + 2, 0, 0]} center distanceFactor={10} style={labelStyle}><div>W</div></Html>
          <Html position={[width * tileSize / 2 - 2, 0, 0]} center distanceFactor={10} style={labelStyle}><div>E</div></Html>
        </group>
      )}

      {showIndexes && (
        <Html center distanceFactor={10} style={indexLabelStyle}>
          <div>{index}</div>
        </Html>
      )}
    </>
  );
};

export default RoomDebugOverlays;
