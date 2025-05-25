import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

const CustomFirstPersonLookControls = forwardRef((props, ref) => {
  const { camera } = useThree();
  const isRotating = useRef(false);

  // Store target and current pitch/yaw for smoothing
  const pitch = useRef(0);
  const yaw = useRef(0);
  const targetPitch = useRef(0);
  const targetYaw = useRef(0);

  const rotationSpeed = props.rotationSpeed || 0.002;
  const dampingFactor = props.dampingFactor || 0.1;

  useImperativeHandle(ref, () => ({
    lookAt: (targetPosition) => {
      camera.lookAt(targetPosition);
      const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
      pitch.current = euler.x;
      yaw.current = euler.y;
      targetPitch.current = euler.x;
      targetYaw.current = euler.y;
    },
    getCameraRotation: () => {
      const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
      return euler;
    },
  }));

  useEffect(() => {
    const canvas = document.querySelector("canvas");

    const handleMouseDown = (event) => {
      if (event.button === 0) { // left mouse button
        isRotating.current = true;
        canvas.requestPointerLock();
      }
    };

    const handleMouseUp = (event) => {
      if (event.button === 0) {
        isRotating.current = false;
        document.exitPointerLock();
      }
    };

    const handleMouseMove = (event) => {
      if (isRotating.current) {
        targetYaw.current -= event.movementX * rotationSpeed;
        targetPitch.current -= event.movementY * rotationSpeed;
        // Clamp pitch to prevent flipping
        targetPitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetPitch.current));
      }
    };

    const handlePointerLockChange = () => {
      isRotating.current = document.pointerLockElement === canvas;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerlockchange", handlePointerLockChange);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
    };
  }, [rotationSpeed]);

  useFrame(() => {
    // Smoothly lerp current rotation towards target
    pitch.current = THREE.MathUtils.lerp(pitch.current, targetPitch.current, dampingFactor);
    yaw.current = THREE.MathUtils.lerp(yaw.current, targetYaw.current, dampingFactor);

    // Compose quaternion from pitch (X axis) and yaw (Y axis)
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch.current);
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    camera.quaternion.copy(yawQuat.multiply(pitchQuat));
  });

  return null;
});

export default CustomFirstPersonLookControls;
