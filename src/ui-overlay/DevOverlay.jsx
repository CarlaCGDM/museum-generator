// Overlay.jsx
import React from 'react';
import './DevOverlay.css';
import ModelSelector from './model-selector/ModelSelector';
import MovementModeToggle from './movement-mode-toggle/MovementModeToggle';

const DevOverlay = ({ onRegenerate, cameraMode, setCameraMode }) => {
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

export default DevOverlay;
