// DoorLabel.jsx
import React from 'react';
import { Html } from '@react-three/drei';
import { ArrowUp } from 'lucide-react';
import './ExitDoorLabel.css';

const ExitDoorLabel = ({
  position,
  rotationY = 0,
  name,
  topicName,
  subtitle = "(509-27 A. C.)",
  indexInTopic = 0,
  totalIndexInTopic = 0,
  topicColor // Now passed as prop from parent
}) => {
  return (
    <group position={position}>
      <group rotation={[0, rotationY, 0]}>
        <Html 
        distanceFactor={8} 
        transform
        scale={0.25} 
        center 
        zIndexRange={[100, 0]}
        occlude>
          <div className="door-label"  style={{ transform: 'scale(4)' }}>
            <div
              className="door-label-topic-banner"
              style={{ backgroundColor: topicColor }}
            >
              <ArrowUp size={16} strokeWidth={2.5} className="arrow-icon" />
              <div className="door-label-topic-text">{topicName}</div>
              <ArrowUp size={16} strokeWidth={2.5} className="arrow-icon" />
            </div>
            <div className="door-label-name">{name}</div>
            <div className="door-label-subtitle">{subtitle}</div>
            <div className="door-label-index">{"SALA " + indexInTopic + "/" + totalIndexInTopic}</div>
          </div>
        </Html>
      </group>
    </group>
  );
};

export default ExitDoorLabel;