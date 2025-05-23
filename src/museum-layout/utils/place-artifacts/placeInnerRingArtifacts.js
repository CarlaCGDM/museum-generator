import { findAllFreeWallTiles, shuffleArray } from './utils.js';

/**
 * Places floor artifacts along an inner ring inside the room boundary.
 * The ring acts like invisible walls for placement purposes.
 * 
 * @param {Array} floorGroups - groups of floor objects with dimensions.
 * @param {number} roomWidth
 * @param {number} roomDepth
 * @param {Set<string>} corridorTiles - forbidden tiles in format "x,z"
 * @returns placed artifacts array similar to placeWallArtifacts output
 */
export function placeInnerRingArtifacts(floorGroups, roomWidth, roomDepth, corridorTiles) {
    const tileSize = 1;

    // Padding from the room boundary to place the inner ring
    const innerRingPadding = 3;

    // Ring coordinates (assuming room center at (0,0))
    // Because roomWidth/Depth are in tiles, half-width/depth
    const halfWidth = roomWidth / 2;
    const halfDepth = roomDepth / 2;

    // Positions of ring walls in world coordinates, offset by padding
    const ringPositions = {
        north: -halfDepth + innerRingPadding,  // z coord
        south: halfDepth - innerRingPadding,
        west: -halfWidth + innerRingPadding,   // x coord
        east: halfWidth - innerRingPadding,
    };

    // Number of tiles on each ring wall (length along that wall)
    const ringWallLengths = {
        north: roomWidth - innerRingPadding * 2,
        south: roomWidth - innerRingPadding * 2,
        west: roomDepth - innerRingPadding * 2,
        east: roomDepth - innerRingPadding * 2,
    };

    // Occupied arrays for each ring wall, initially free unless corridor tile exists there
    const occupiedRingTiles = {
        north: new Array(ringWallLengths.north).fill(false),
        south: new Array(ringWallLengths.south).fill(false),
        west: new Array(ringWallLengths.west).fill(false),
        east: new Array(ringWallLengths.east).fill(false),
    };

    const mapTileToRingIndex = (wall, x, z) => {
        switch (wall) {
            case 'north': return Math.floor(x + halfWidth) - innerRingPadding;
            case 'south': return Math.floor(x + halfWidth) - innerRingPadding;
            case 'west': return Math.floor(z + halfDepth) - innerRingPadding;
            case 'east': return Math.floor(z + halfDepth) - innerRingPadding;
        }
    };

    // Mark corridor tiles as occupied on the ring walls
    for (const tileStr of corridorTiles) {
        const [xStr, zStr] = tileStr.split(',');
        const x = parseInt(xStr, 10);
        const z = parseInt(zStr, 10);

        if (z === Math.floor(ringPositions.north)) {
            const idx = mapTileToRingIndex('north', x, z);
            if (idx >= 0 && idx < occupiedRingTiles.north.length) occupiedRingTiles.north[idx] = true;
        }
        if (z === Math.floor(ringPositions.south)) {
            const idx = mapTileToRingIndex('south', x, z);
            if (idx >= 0 && idx < occupiedRingTiles.south.length) occupiedRingTiles.south[idx] = true;
        }
        if (x === Math.floor(ringPositions.west)) {
            const idx = mapTileToRingIndex('west', x, z);
            if (idx >= 0 && idx < occupiedRingTiles.west.length) occupiedRingTiles.west[idx] = true;
        }
        if (x === Math.floor(ringPositions.east)) {
            const idx = mapTileToRingIndex('east', x, z);
            if (idx >= 0 && idx < occupiedRingTiles.east.length) occupiedRingTiles.east[idx] = true;
        }
    }

    // Blacklist the four corners of the ring
    const ringXStart = Math.floor(ringPositions.west);
    const ringXEnd = Math.floor(ringPositions.east);
    const ringZStart = Math.floor(ringPositions.north);
    const ringZEnd = Math.floor(ringPositions.south);

    const corners = [
        ['north', ringXStart, ringZStart],
        ['north', ringXEnd, ringZStart],
        ['south', ringXStart, ringZEnd],
        ['south', ringXEnd, ringZEnd],
        ['west', ringXStart, ringZStart],
        ['west', ringXStart, ringZEnd],
        ['east', ringXEnd, ringZStart],
        ['east', ringXEnd, ringZEnd],
    ];

    for (const [wall, x, z] of corners) {
        const idx = mapTileToRingIndex(wall, x, z);
        if (idx >= 0 && idx < occupiedRingTiles[wall].length) {
            occupiedRingTiles[wall][idx] = true;
        }
    }


    const placed = [];

    floorGroups.forEach(group => {

        // Shuffle ring walls to randomize placement order
        const ringWalls = shuffleArray(['north', 'south', 'east', 'west']);

        const totalWidth = group.reduce((sum, item) => sum + item.dimensions.width, 0);
        const tilesNeeded = Math.ceil(totalWidth / tileSize);

        let placedOnRing = false;

        for (const wall of ringWalls) {
            const freeIndices = findAllFreeWallTiles(occupiedRingTiles[wall], tilesNeeded);

            if (freeIndices.length > 0) {
                const randomIndex = freeIndices[Math.floor(Math.random() * freeIndices.length)];

                // Mark buffer and occupied tiles
                if (randomIndex > 0) occupiedRingTiles[wall][randomIndex - 1] = true;
                for (let t = randomIndex; t < randomIndex + tilesNeeded; t++) {
                    occupiedRingTiles[wall][t] = true;
                }
                if (randomIndex + tilesNeeded < occupiedRingTiles[wall].length) {
                    occupiedRingTiles[wall][randomIndex + tilesNeeded] = true;
                }

                // Compute position and rotation based on wall orientation
                let posX = 0, posZ = 0, rotationY = 0;
                const maxDepth = Math.max(...group.map(item => item.dimensions.depth));

                switch (wall) {
                    case 'north':
                        posZ = ringPositions.north + maxDepth / 2;
                        posX = -halfWidth + innerRingPadding + (randomIndex + tilesNeeded / 2) * tileSize;
                        rotationY = 0; // Face south (away from north ring)
                        break;
                    case 'south':
                        posZ = ringPositions.south - maxDepth / 2;
                        posX = -halfWidth + innerRingPadding + (randomIndex + tilesNeeded / 2) * tileSize;
                        rotationY = Math.PI; // Face north (away from south ring)
                        break;
                    case 'east':
                        posX = ringPositions.east - maxDepth / 2;
                        posZ = -halfDepth + innerRingPadding + (randomIndex + tilesNeeded / 2) * tileSize;
                        rotationY = -Math.PI / 2; // Face west (away from east ring)
                        break;
                    case 'west':
                        posX = ringPositions.west + maxDepth / 2;
                        posZ = -halfDepth + innerRingPadding + (randomIndex + tilesNeeded / 2) * tileSize;
                        rotationY = Math.PI / 2; // Face east (away from west ring)
                        break;
                }

                placed.push({
                    contents: group,
                    position: [posX, 0, posZ],
                    rotationY,
                    isWall: false,
                });

                placedOnRing = true;
                break;
            }
        }

        if (!placedOnRing) {
            console.warn('Could not place floor group on inner ring:', group);
        }
    });

    return placed;
}
