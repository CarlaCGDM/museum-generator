import React, { useMemo } from 'react';

const WallTile = ({ tileSize = 1, direction = 'north', color = '#888' }) => {
    const rotationY = useMemo(() => {
        switch (direction) {
            case 'east': return -Math.PI / 2;
            case 'south': return Math.PI;
            case 'west': return Math.PI / 2;
            default: return 0;
        }
    }, [direction]);

    return (
        <group>
            <mesh position={[0,1.25,-0.5]} rotation={[0, rotationY, 0]}>
                <boxGeometry args={[tileSize, 2.5, tileSize * 0.2]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0,1.25,-0.5]} rotation={[0, rotationY, 0]}>
                <boxGeometry args={[tileSize, 2.5, tileSize * 0.2]} />
                <meshStandardMaterial color={"black"} wireframe/>
            </mesh>
            <mesh>
                <boxGeometry args={[tileSize, 0.05, tileSize]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh>
                <boxGeometry args={[tileSize, 0.05, tileSize]} />
                <meshStandardMaterial color={"black"} wireframe/>
            </mesh>
        </group>
    );
};

export default WallTile;