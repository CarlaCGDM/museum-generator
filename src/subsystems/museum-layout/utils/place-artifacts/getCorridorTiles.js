export function getCorridorTiles(doorTiles, roomWidth, roomDepth, corridorWidth = 2) {
    console.log('doorTiles:', doorTiles);
    const blacklist = new Set();

    const centerX = Math.floor(roomWidth / 2);
    const centerZ = Math.floor(roomDepth / 2);

    for (const { x: doorX, z: doorZ } of doorTiles) {
        const steps = 100;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = Math.round(doorX + t * (centerX - doorX));
            const pz = Math.round(doorZ + t * (centerZ - doorZ));

            for (let dx = -Math.floor(corridorWidth / 2); dx <= Math.floor(corridorWidth / 2); dx++) {
                for (let dz = -Math.floor(corridorWidth / 2); dz <= Math.floor(corridorWidth / 2); dz++) {
                    const tx = px + dx;
                    const tz = pz + dz;

                    if (tx >= 0 && tx < roomWidth && tz >= 0 && tz < roomDepth) {
                        blacklist.add(`${tx},${tz}`);
                    }
                }
            }
        }
    }

    return blacklist;
}
