import React from 'react';

const RoomOcclusionWalls = ({ width, depth, tileSize = 1, wallHeight = 4 }) => {
  const roomWidth = width * tileSize;
  const roomDepth = depth * tileSize;

  return (
    <group>
      <mesh position={[0, wallHeight / 2, -roomDepth / 2]} visible={false}>
        <boxGeometry args={[roomWidth, wallHeight, 0.1]} />
        <meshBasicMaterial />
      </mesh>
      <mesh position={[0, wallHeight / 2, roomDepth / 2]} visible={false}>
        <boxGeometry args={[roomWidth, wallHeight, 0.1]} />
        <meshBasicMaterial />
      </mesh>
      <mesh position={[-roomWidth / 2, wallHeight / 2, 0]} visible={false}>
        <boxGeometry args={[0.1, wallHeight, roomDepth]} />
        <meshBasicMaterial />
      </mesh>
      <mesh position={[roomWidth / 2, wallHeight / 2, 0]} visible={false}>
        <boxGeometry args={[0.1, wallHeight, roomDepth]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
};

export default RoomOcclusionWalls;
