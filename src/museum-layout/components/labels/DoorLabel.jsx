// DoorLabel.jsx
import React from 'react';
import { Html } from '@react-three/drei';
import { ArrowUp } from 'lucide-react';
import './DoorLabel.css';

const DoorLabel = ({ 
  position, 
  rotationY = 0, 
  name, 
  topicId = "0", 
  topicName, 
  description,
  topicColor // Now passed as prop from parent
}) => {
  return (
    <group position={position}>
      <group rotation={[0, rotationY, 0]}>
        <Html distanceFactor={8} occlude transform center>
          <div className="door-label">
            <div
              className="door-label-topic-banner"
              style={{ backgroundColor: topicColor }}
            >
              <ArrowUp size={16} strokeWidth={2.5} className="arrow-icon" />
              <span className="door-label-topic-text">{topicName}</span>
              <ArrowUp size={16} strokeWidth={2.5} className="arrow-icon" />
            </div>
            <div className="door-label-name">{name}</div>
            <div className="door-label-description">{description}</div>
          </div>
        </Html>
      </group>
    </group>
  );
};

export default DoorLabel;