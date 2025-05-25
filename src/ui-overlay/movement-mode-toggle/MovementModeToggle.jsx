import React from 'react';

const MovementModeToggle = ({ cameraMode, setCameraMode }) => {
  return (
    <div className="overlay-panel">
      <div className="overlay-header">
        <h3>MOVEMENT MODE</h3>
      </div>

      <div className="model-controls">
        <button
          className="reset-button"
          onClick={() => setCameraMode('orbit')}
          style={{ background: cameraMode === 'orbit' ? '#d0d0d0' : undefined }}
        >
          ORBIT
        </button>
        <button
          className="reset-button"
          onClick={() => setCameraMode('firstperson')}
          style={{ background: cameraMode === 'firstperson' ? '#d0d0d0' : undefined }}
        >
          FIRST PERSON
        </button>
      </div>
    </div>
  );
};

export default MovementModeToggle;
