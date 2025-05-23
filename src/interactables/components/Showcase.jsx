import React from 'react';
import MuseumObject from './MuseumObject';

const Showcase = ({
  contents = [],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const isWall = contents[0]?.onWall;

  const eyeLevel = 1.5;
  const spacingRatio = 0.1;
  const paddingRatio = 0.1;

  const objectWidths = contents.map(obj => obj.dimensions.width);
  const objectDepths = contents.map(obj => obj.dimensions.depth);
  const objectHeights = contents.map(obj => obj.dimensions.height);

  const totalWidth = objectWidths.reduce((sum, w) => sum + w, 0);
  const maxDepth = Math.max(...objectDepths);
  const tallestObject = Math.max(...objectHeights);

  const spacing = totalWidth * spacingRatio / (contents.length - 1 || 1);
  const rawWidth = totalWidth + spacing * (contents.length - 1);
  const rawDepth = maxDepth;

  const showcaseWidth = rawWidth * (1 + 2 * paddingRatio);
  const showcaseDepth = rawDepth * (1 + 2 * paddingRatio);

  const suggestedHeight = eyeLevel - tallestObject / 2;
  const showcaseHeight = isWall ? 0 : Math.max(0.2, suggestedHeight);
  const yOffset = isWall ? 0 : showcaseHeight;

  // Place objects side-by-side horizontally
  let offset = -rawWidth / 2;

  const placedObjects = contents.map((item) => {
    const size = item.dimensions.width;
    const x = offset + size / 2;
    const z = isWall
      ? item.dimensions.depth / 2 - showcaseDepth / 2 + paddingRatio * 2
      : 0;

    offset += size + spacing;

    return (
      <MuseumObject
        key={item.id}
        {...item}
        position={[x, 0, z]}
      />
    );
  });

  return (
    <group position={[position[0], yOffset, position[2]]} rotation={rotation}>
      {/* Base plinth only for non-wall showcases */}
      {!isWall && (
        <group>
          <mesh position={[0, -showcaseHeight / 2, 0]}>
            <boxGeometry args={[showcaseWidth, showcaseHeight, showcaseDepth]} />
            <meshStandardMaterial color="gray" />
          </mesh>
          <mesh position={[0, -showcaseHeight / 2, 0]}>
            <boxGeometry args={[showcaseWidth, showcaseHeight, showcaseDepth]} />
            <meshStandardMaterial color="black" wireframe />
          </mesh>
        </group>
      )}

      <group>{placedObjects}</group>
    </group>
  );
};

export default Showcase;
