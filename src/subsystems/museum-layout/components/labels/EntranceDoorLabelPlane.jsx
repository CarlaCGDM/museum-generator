import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

const canvasSize = { width: 512, height: 256 };

const EntranceDoorLabelPlane = ({
  position = [0, 0, 0],
  rotationY = 0,
  name,
  topicName,
  subtitle,
  indexInTopic = 0,
  totalIndexInTopic = 0,
  topicColor = '#eeeeee',
}) => {
  const [texture, setTexture] = useState(null);

  // Create canvas label texture
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');

    // Fill background (flat, no border/shadow)
    ctx.fillStyle = topicColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text content
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(topicName?.toUpperCase(), canvas.width / 2, 40);

    ctx.textAlign = 'left';
    ctx.font = '20px sans-serif';
    ctx.fillText(name?.toUpperCase(), canvas.width * 0.2, 90);
    ctx.fillText(subtitle?.toUpperCase(), canvas.width * 0.2, 130);

    ctx.textAlign = 'center';
    ctx.font = '18px sans-serif';
    ctx.fillText(`SALA ${indexInTopic}/${totalIndexInTopic}`, canvas.width / 2, canvas.height - 40);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    setTexture(tex);
  }, [topicName, name, subtitle, indexInTopic, totalIndexInTopic, topicColor]);

  if (!texture) return null;

  // Dimensions must match for both box and label
  const width = 2.5;
  const height = 1.25;
  const depth = 0.1;

  return (
    <group position={position}>
      <group rotation={[0, rotationY, 0]}>
        {/* 3D Box Backing */}
        <mesh position={[0, 0, -depth / 2 -0.001]}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={topicColor} />
        </mesh>

        {/* Front Label Plane */}
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>
      </group>
    </group>
  );
};

export default EntranceDoorLabelPlane;
