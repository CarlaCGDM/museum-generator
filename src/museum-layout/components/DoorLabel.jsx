import { Html } from '@react-three/drei';
import './DoorLabel.css';

const DoorLabel = ({ position, rotationY = 0, name, description }) => {
  return (
    <group position={position}>
      <group rotation={[0, rotationY, 0]}>
        <Html
          distanceFactor={8}
          occlude
          transform
          center
        >
          <div className="door-label">
            <strong className="door-label-title">⬆️{name}⬆️</strong>
            <div className="door-label-description">{description}</div>
          </div>
        </Html>
      </group>
    </group>
  );
};

export default DoorLabel;
