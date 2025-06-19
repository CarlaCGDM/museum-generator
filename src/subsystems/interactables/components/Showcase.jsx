import React, { useRef, useEffect } from 'react';
import MuseumObject from './MuseumObject';
import { useSettings } from '../../ui-overlay/SettingsContext';
import { useIsPlayerNear } from '../../first-person-movement/hooks/useIsPlayerNear';
import { useIsMobile } from '../hooks/useIsMobile';
import { useMuseum } from '../../museum-layout/components/MuseumProvider';

const Showcase = ({
  contents = [],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  index = 0,
}) => {
  const isWall = contents[0]?.onWall;

  const { addOccluderRef, removeOccluderRef } = useMuseum();
  const isMobile = useIsMobile();
  const { settings } = useSettings();
  const isPlayerInThisRoom = settings.currentRoomIndex === index;
  const isPlayerInPreviousRoom = settings.currentRoomIndex == index - 1;
  const isPlayerInNextRoom = settings.currentRoomIndex == index + 1;

  const isPlayerNear = useIsPlayerNear(position, 7);

  // FIXED: Create refs for the meshes we want to use as occluders
  const baseRef = useRef();
  const wireframeRef = useRef();

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

  // FIXED: Register showcase base as occluder
  useEffect(() => {
    if (isWall) return;

    const registerOccluder = () => {
      if (!baseRef.current) {
        setTimeout(registerOccluder, 100);
        return;
      }

      const showcaseId = `showcase-${index}-base`;
      addOccluderRef(index, showcaseId, baseRef);
    };

    registerOccluder();

    return () => {
      const showcaseId = `showcase-${index}-base`;
      removeOccluderRef(index, showcaseId);
    };
  }, [index, isWall, addOccluderRef, removeOccluderRef]);

  // Place objects side-by-side horizontally
  let offset = -rawWidth / 2;

  const placedObjects = contents.map((item, objIndex) => {
    const size = item.dimensions.width;
    const x = offset + size / 2;
    const z = isWall
      ? item.dimensions.depth / 2 - showcaseDepth / 2 + paddingRatio * 6
      : 0;

    offset += size + spacing;

    return (
      <MuseumObject
        key={item.id}
        {...item}
        position={[x, 0, z]}
        isPlayerInThisRoom={isPlayerInThisRoom}
        isPlayerNear={isPlayerNear}
        // FIXED: Pass the room index and object index for occlusion registration
        roomIndex={index}
        objectIndex={objIndex}
      />
    );
  });

  const shouldRender = isMobile
    ? isPlayerInThisRoom
    : isPlayerInThisRoom || isPlayerInPreviousRoom || isPlayerInNextRoom;

  if (!shouldRender) return null;

  return (
    <group position={[position[0], yOffset, position[2]]} rotation={rotation}>
      {/* Base plinth only for non-wall showcases */}
      {!isWall && (
        <group>
          <mesh ref={baseRef} position={[0, -showcaseHeight / 2, 0]}>
            <boxGeometry args={[showcaseWidth, showcaseHeight, showcaseDepth]} />
            <meshStandardMaterial
              color="black"
              depthWrite={true}  // Ensure it writes to depth buffer
            />
          </mesh>
          {/* <mesh ref={wireframeRef} position={[0, -showcaseHeight / 2, 0]}>
            <boxGeometry args={[showcaseWidth, showcaseHeight, showcaseDepth]} />
            <meshStandardMaterial color="red" wireframe />
          </mesh> */}
        </group>
      )}

      <group>{placedObjects}</group>
    </group>
  );
};

export default Showcase;