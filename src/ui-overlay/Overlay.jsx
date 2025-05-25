// Overlay.jsx
import React from 'react';
import './Overlay.css';
import ModelSelector from './model-selector/ModelSelector';
import MovementModeToggle from './movement-mode-toggle/MovementModeToggle';

const Overlay = ({ onRegenerate, cameraMode, setCameraMode }) => {
  return (
    <div className="overlay">
      <div className="overlay-panel">
    <ModelSelector onRegenerate={onRegenerate} />
  </div>
  <div className="overlay-panel">
    <MovementModeToggle cameraMode={cameraMode} setCameraMode={setCameraMode} />
  </div>
    </div>
  );
};

export default Overlay;
