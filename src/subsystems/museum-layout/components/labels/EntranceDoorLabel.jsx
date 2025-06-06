// DoorLabel.jsx
import React from 'react';
import { Html } from '@react-three/drei';
import './EntranceDoorLabel.css';

const EntranceDoorLabel = ({
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
          <div className="door-label"  style={{ transform: 'scale(4)',  backgroundColor: topicColor }}>
            <div
              className="door-label-topic-banner"
            >
             
              <div className="door-label-topic-text">{topicName}</div>
            
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

export default EntranceDoorLabel;