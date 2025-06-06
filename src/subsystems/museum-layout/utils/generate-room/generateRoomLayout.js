import { computeDoorTiles } from './computeDoorTiles';
import { computeNextRoomPosition } from './computeNextRoomPosition';
import { computeInteriorWallTiles } from './computeInteriorWallTiles';
import { markTiles, wouldOverlap } from './occupancyHelpers';

const getRandomColor = () => {
    const randomColor = () => Math.floor(Math.random() * 256);
    return `rgb(${randomColor()}, ${randomColor()}, ${randomColor()})`;
};

const placeFirstRoom = (firstRoom, tileSize, occupiedTiles) => {
    const initialPos = {
        x: (firstRoom.width * tileSize) / 2,
        z: (firstRoom.depth * tileSize) / 2
    };

    markTiles(occupiedTiles, initialPos, firstRoom.width, firstRoom.depth);

    return {
        position: initialPos,
        color: getRandomColor(),
        needsCorrection: false
    };
};

const placeNextRoom = ({ fromRoom, toRoom, currentPos, occupiedTiles, tileSize }) => {
    const directions = ['north', 'east', 'south', 'west'];
    let chosenDirection = null;
    let nextPos = null;
    let needsCorrection = false;

    while (directions.length > 0) {
        const randIndex = Math.floor(Math.random() * directions.length);
        const direction = directions.splice(randIndex, 1)[0];

        const result = computeNextRoomPosition(
            currentPos,
            fromRoom.width,
            fromRoom.depth,
            toRoom.width,
            toRoom.depth,
            direction,
            tileSize
        );

        if (!wouldOverlap(occupiedTiles, result.position, toRoom.width, toRoom.depth)) {
            chosenDirection = direction;
            nextPos = result.position;
            needsCorrection = result.needsCorrection;
            return { nextPos, chosenDirection, needsCorrection };
        }
    }

    return null;
};

const generateSingleLayout = (roomDefinitions, tileSize = 1, logger = () => { }) => {
    const roomPositions = [];
    const doorLinks = [];
    const interiorWalls = [];
    const roomColors = [];
    const occupiedTiles = new Set();
    const parityCorrections = [];

    const firstRoom = roomDefinitions[0];
    const { position: initialPos, color: initialColor } = placeFirstRoom(firstRoom, tileSize, occupiedTiles);
    const firstRoomWalls = computeInteriorWallTiles(
        firstRoom.width,
        firstRoom.depth,
        5,
        logger
    );
    interiorWalls.push(firstRoomWalls);

    roomPositions.push(initialPos);
    roomColors.push(initialColor);
    parityCorrections.push(false);

    let currentPos = initialPos;

    for (let i = 0; i < roomDefinitions.length - 1; i++) {
        const fromRoom = roomDefinitions[i];
        const toRoom = roomDefinitions[i + 1];

        const placement = placeNextRoom({ fromRoom, toRoom, currentPos, occupiedTiles, tileSize });

        if (!placement) {
            logger(`❌ Could not place room ${i + 1} without overlap`);
            // Return null to indicate failure instead of partial data
            return null;
        }

        const { nextPos, chosenDirection, needsCorrection } = placement;

        logger(`✅ Placed room ${i + 1} (${toRoom.width}x${toRoom.depth}) ${chosenDirection} of previous`);
        logger(`    ➜ Position: (${nextPos.x}, ${nextPos.z})  Correction: ${needsCorrection}`);

        const doors = computeDoorTiles(
            fromRoom.width,
            fromRoom.depth,
            toRoom.width,
            toRoom.depth,
            chosenDirection,
            needsCorrection,
            logger
        );

        const walls = computeInteriorWallTiles(
            toRoom.width,
            toRoom.depth,
            5,
            logger
        );

        roomPositions.push(nextPos);
        roomColors.push(getRandomColor());
        doorLinks.push({ direction: chosenDirection, doors });
        interiorWalls.push(walls);
        parityCorrections.push(needsCorrection);
        markTiles(occupiedTiles, currentPos, fromRoom.width, fromRoom.depth);

        currentPos = nextPos;
    }

    return {
        roomPositions,
        doorLinks,
        interiorWalls: roomDefinitions.map(() => ({ tiles: [], oppositeSideTiles: [] })),
        roomColors,
        parityCorrections
    };
};

export const generateRoomLayout = (roomDefinitions, tileSize = 1, logger = () => { }) => {
    const maxAttempts = 10;
    let attempt = 1;

    while (attempt <= maxAttempts) {
        logger(`🔄 Generation attempt ${attempt}/${maxAttempts}`);
        
        const result = generateSingleLayout(roomDefinitions, tileSize, logger);
        
        if (result) {
            logger(`✅ Successfully generated layout on attempt ${attempt}`);
            return result;
        }
        
        logger(`❌ Attempt ${attempt} failed, retrying...`);
        attempt++;
    }

    // If all attempts fail, throw an error or return a fallback
    logger(`💥 Failed to generate valid layout after ${maxAttempts} attempts`);
    throw new Error(`Failed to generate museum layout after ${maxAttempts} attempts`);
};