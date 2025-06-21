import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { ArrowUp, Check } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Utility: Draw SVG to canvas
function drawIconToCanvas({ icon, color, rotation = 0 }) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Convert React icon to SVG
  const svgString = renderToStaticMarkup(icon);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(rotation);
      ctx.translate(-size / 2, -size / 2);
      ctx.drawImage(img, (size - 48) / 2, (size - 48) / 2, 48, 48);
      ctx.restore();
      URL.revokeObjectURL(url);

      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 4;
      tex.needsUpdate = true;
      resolve(tex);
    };
    img.src = url;
  });
}

const FloorLabelPlane = ({
  width,
  depth,
  tileSize,
  xOffset,
  zOffset,
  currentRoomColor = 'pink',
  nextRoomColor = null,
  roomDoorInfoEntry = {},
}) => {
  const {
    entranceRotation = 0,
    exitRotation = 0,
    entranceTiles = [],
    exitTiles = [],
  } = roomDoorInfoEntry;

  const hasDoors = entranceTiles.length || exitTiles.length;
  const [texture, setTexture] = useState(null);

  const labelPos = useMemo(() => {
    const roomCenterX = xOffset + (width * tileSize) / 2 - tileSize / 2;
    const roomCenterZ = zOffset + (depth * tileSize) / 2 - tileSize / 2;
    return [roomCenterX, 0.001, roomCenterZ];
  }, [width, depth, tileSize, xOffset, zOffset]);

  useEffect(() => {
    if (!hasDoors) return;

    const labelX = labelPos[0];
    const labelZ = labelPos[2];

    const exitMid = exitTiles.length > 0
      ? exitTiles[Math.floor(exitTiles.length / 2)]
      : null;

    const exitMidX = exitMid ? xOffset + exitMid.x * tileSize : labelX;
    const exitMidZ = exitMid ? zOffset + exitMid.z * tileSize : labelZ;

    const computedExitRotation = Math.atan2(exitMidX - labelX, -(exitMidZ - labelZ));
    const icon = nextRoomColor
      ? <ArrowUp size={48} strokeWidth={3} color="white" />
      : <Check size={48} strokeWidth={3} color="white" />;

    const baseColor = nextRoomColor || currentRoomColor;

    drawIconToCanvas({
      icon,
      color: baseColor,
      rotation: nextRoomColor ? computedExitRotation : -entranceRotation,
    }).then(setTexture);
  }, [
    hasDoors,
    entranceRotation,
    exitRotation,
    entranceTiles,
    exitTiles,
    currentRoomColor,
    nextRoomColor,
    tileSize,
    xOffset,
    zOffset,
    labelPos,
  ]);

  if (!hasDoors || !texture) return null;

  return (
    <mesh position={labelPos} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.5, 0.5]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
};

export default FloorLabelPlane;
