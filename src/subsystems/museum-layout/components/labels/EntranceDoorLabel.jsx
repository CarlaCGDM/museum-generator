// DoorLabel.jsx
import React from 'react';
import { Html } from '@react-three/drei';
import './EntranceDoorLabel.css';
import * as THREE from "three";

const EntranceDoorLabel = ({
  position,
  rotationY = 0,
  name,
  topicName,
  subtitle,
  indexInTopic = 0,
  totalIndexInTopic = 0,
  topicColor,
  occlude,
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
        occlude={occlude}
        >
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