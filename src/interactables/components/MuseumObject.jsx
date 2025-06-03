import React from 'react';
import { Html } from '@react-three/drei';
import { render } from '@testing-library/react';

const MuseumObject = ({
  name = 'Artifact',
  dimensions = { width: 1, depth: 1, height: 1 },
  onWall = false,
  starred = false,
  position = [0, 0, 0],
  modelPath = null,
  group = null,
  isPlayerInThisRoom = false,
  isPlayerNear = false,
}) => {
  const { width, depth, height } = dimensions;

  const boxColor = starred
    ? 'gold'
    : onWall
      ? 'skyblue'
      : group
        ? 'seagreen'
        : 'tomato';

  const yOffset = onWall ? 1.5 : height / 2;


  return (
    <group position={[position[0], yOffset, position[2]]}>
      {/* Main Box */}
      <group>
        <mesh>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={boxColor} />
        </mesh>
        <mesh>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="black" wireframe />
        </mesh>
      </group>

      {/* Direction Arrow */}
      <mesh position={[0, 0, depth / 2 + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Label */}
      {isPlayerInThisRoom && isPlayerNear &&
      <group position={[0,height*0.5 + 0.25,0]}>
        <Html
          center
          distanceFactor={10}
          style={labelStyle}
          //occlude
          >
          <div>{name}</div>
        </Html>
        </group>
        }
    </group>
  );
};

const labelStyle = {
  pointerEvents: 'none',
  fontSize: '12px',
  fontWeight: 'bold',
  background: 'white',
  padding: '2px 4px',
  borderRadius: '4px',
  color: 'black',
};

export default MuseumObject;
