import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { renderToStaticMarkup } from 'react-dom/server';
import { ArrowUp } from 'lucide-react';

const canvasSize = { width: 512, height: 256 };

const ExitDoorLabelPlane = ({
  position = [0, 0, 0],
  rotationY = 0,
  name,
  topicName,
  subtitle = '(509-27 A. C.)',
  indexInTopic = 0,
  totalIndexInTopic = 0,
  topicColor = '#eeeeee',
}) => {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');

    // === BACKGROUND ===
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // === TOPIC BANNER ===
    const bannerHeight = 64;
    ctx.fillStyle = topicColor;
    ctx.fillRect(0, 0, canvas.width, bannerHeight);

    // Draw arrows (SVG)
    const arrowMarkup = renderToStaticMarkup(
      <ArrowUp size={24} strokeWidth={2.5} color="black" />
    );
    const arrowBlob = new Blob([arrowMarkup], { type: 'image/svg+xml' });
    const arrowURL = URL.createObjectURL(arrowBlob);

    const drawArrowsAndText = () => {
      const arrowImg = new Image();
      arrowImg.onload = () => {
        const centerY = bannerHeight / 2;
        ctx.drawImage(arrowImg, canvas.width / 2 - 120, centerY - 12, 24, 24);
        ctx.drawImage(arrowImg, canvas.width / 2 + 96, centerY - 12, 24, 24);
        URL.revokeObjectURL(arrowURL);

        // === TOPIC TEXT ===
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(topicName?.toUpperCase(), canvas.width / 2, centerY + 1);

        // === NAME ===
        ctx.textAlign = 'left';
        ctx.font = '16px sans-serif';
        ctx.fillText(name?.toUpperCase(), canvas.width * 0.2, 100);

        // === SUBTITLE ===
        ctx.fillText(subtitle?.toUpperCase(), canvas.width * 0.2, 130);

        // === INDEX ===
        ctx.textAlign = 'center';
        ctx.font = '14px sans-serif';
        ctx.fillText(`SALA ${indexInTopic}/${totalIndexInTopic}`, canvas.width / 2, canvas.height - 40);

        // === Create Texture ===
        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 4;
        tex.needsUpdate = true;
        setTexture(tex);
      };
      arrowImg.src = arrowURL;
    };

    drawArrowsAndText();
  }, [topicName, name, subtitle, indexInTopic, totalIndexInTopic, topicColor]);

  if (!texture) return null;

  // Dimensions: matches canvas aspect ratio
  const width = 2.5;
  const height = 1.25;
  const depth = 0.1;

  return (
    <group position={position}>
      <group rotation={[0, rotationY, 0]}>
        {/* Backing box for 3D thickness */}
        <mesh position={[0, 0, -depth / 2 -0.001]}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={'white'} />
        </mesh>

        {/* Front label */}
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>
      </group>
    </group>
  );
};

export default ExitDoorLabelPlane;
