import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { FLOOR_LAYER, WALL_LAYER } from '../utils/layers';

const FirstPersonMovementController = ({ cameraMode }) => {
    const { camera, scene } = useThree();
    const { size, gl } = useThree(); // size = { width, height }, gl.domElement is canvas
    const destination = useRef(null);
    const raycaster = useRef(new THREE.Raycaster());
    const pointer = useRef(new THREE.Vector2());
    const isDragging = useRef(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const hoverIndicatorRef = useRef();

    const moveSpeed = 0.1;

    useEffect(() => {
        if (cameraMode !== 'firstperson') return;

        const handleMouseDown = (e) => {
            isDragging.current = false;
            dragStartPos.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseMove = (e) => {
            const dx = e.clientX - dragStartPos.current.x;
            const dy = e.clientY - dragStartPos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) { // threshold in pixels, adjust as needed
                isDragging.current = true;
            }
        };

        const handleMouseUp = (e) => {
            if (isDragging.current) return;

            if (e.target.closest('.ui-blocker')) return;

            const canvasRect = gl.domElement.getBoundingClientRect();

            pointer.current.x = ((e.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
            pointer.current.y = -((e.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;

            raycaster.current.setFromCamera(pointer.current, camera);

            // Enable both wall and floor layers
            raycaster.current.layers.enable(FLOOR_LAYER);
            raycaster.current.layers.enable(WALL_LAYER);

            const intersects = raycaster.current.intersectObjects(scene.children, true);

            let wallHit = null;
            let floorHit = null;

            const floorLayerMask = new THREE.Layers();
            floorLayerMask.set(FLOOR_LAYER);

            const wallLayerMask = new THREE.Layers();
            wallLayerMask.set(WALL_LAYER);

            for (const hit of intersects) {
                const object = hit.object;
                if (!object || !object.layers) continue;

                if (object.layers.test(wallLayerMask)) {
                    wallHit = hit;
                    break;
                }

                if (object.layers.test(floorLayerMask) && !floorHit) {
                    floorHit = hit;
                }
            }

            if (wallHit) {
                console.log('Wall hit detected. Movement blocked.');
                return;
            }

            if (floorHit) {
                const point = floorHit.point.clone();
                destination.current = point;
                console.log('Destination set to:', point);

                if (hoverIndicatorRef.current) {
                    hoverIndicatorRef.current.visible = true;
                    hoverIndicatorRef.current.position.set(point.x, point.y + 0.05, point.z);
                }
            }

        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [camera, scene, cameraMode]);

    useFrame(() => {
        // Movement logic (unchanged)
        if (destination.current && cameraMode === 'firstperson') {
            const target = destination.current.clone();
            target.y = camera.position.y;

            const dir = new THREE.Vector3().subVectors(target, camera.position);
            const dist = dir.length();

            if (dist > 0.1) {
                dir.normalize();
                camera.position.add(dir.multiplyScalar(moveSpeed));
            } else {
                camera.position.copy(target);
                destination.current = null;
                if (hoverIndicatorRef.current) {
                    hoverIndicatorRef.current.visible = false;
                }
            }
        }

        // Hover logic — only floor layer
        if (cameraMode === 'firstperson') {
            raycaster.current.layers.set(FLOOR_LAYER);
            raycaster.current.setFromCamera(pointer.current, camera);
            const intersects = raycaster.current.intersectObjects(scene.children, true);
        }
    });

    // Memoize circle geometry and material to avoid recreating on every render
    const circleGeometry = useMemo(() => new THREE.CircleGeometry(0.3, 32), []);
    const circleMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        color: 'green',
        opacity: 0.5,
        transparent: true,
    }), []);

    return (
        <mesh
            ref={hoverIndicatorRef}
            rotation={[-Math.PI / 2, 0, 0]}
            geometry={circleGeometry}
            material={circleMaterial}
            visible={false}
        />
    );
};

export default FirstPersonMovementController;
