import { useMemo, useEffect, useRef } from 'react';
import Room from './Room';
import Showcase from '../../interactables/components/Showcase';
import { generateRoomLayout } from '../utils/generate-room/generateRoomLayout';
import { useDebug } from '../../debug/DebugContext';
import { createLogger } from '../../debug/utils/logger';
import { useRoomVisitTracker } from '../hooks/useRoomVisitTracker';

// 🧠 Group artifacts by their group ID
function groupArtifacts(artifacts) {
  const grouped = new Map();
  for (const artifact of artifacts) {
    const key = artifact.group ?? `ungrouped-${artifact.id}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(artifact);
  }
  return [...grouped.values()];
}

const MuseumLayout = ({ roomData, setRoomPositions }) => {
  // Debug logger (stable)
  const debugGenerateLayout = useDebug('Layout', 'generateRoomLayout');
  const logger = useMemo(
    () => createLogger(debugGenerateLayout, 'generateRoomLayout'),
    [debugGenerateLayout]
  );

  // Memoized room definitions
  const roomDefinitions = useMemo(
    () =>
      roomData.map(room => ({
        width: room.dimensions.width,
        depth: room.dimensions.depth,
      })),
    [roomData]
  );

  // Memoized room layout
  const { roomPositions, doorLinks, interiorWalls } = useMemo(() => {
    const layout = generateRoomLayout(roomDefinitions, 1, logger);

    const firstRoomPos = layout.roomPositions[0];
    const firstRoomSize = roomDefinitions[0];

    const centerOffsetX = firstRoomPos.x + firstRoomSize.width / 2;
    const centerOffsetZ = firstRoomPos.z + firstRoomSize.depth / 2;

    const centeredPositions = layout.roomPositions.map(pos => ({
      x: pos.x - centerOffsetX * 0.5,
      z: pos.z - centerOffsetZ * 0.5,
    }));

    return {
      ...layout,
      roomPositions: centeredPositions,
    };
  }, [roomDefinitions, logger]);

  // Prevent unnecessary layout re-setting
  const lastRoomPositions = useRef(null);
  useEffect(() => {
    const positionsChanged = JSON.stringify(lastRoomPositions.current) !== JSON.stringify(roomPositions);
    if (positionsChanged) {
      lastRoomPositions.current = roomPositions;
      setRoomPositions?.(roomPositions);
    }
  }, [roomPositions, setRoomPositions]);

  return (
    <group>
      {roomData.map((room, index) => {
        const { width, depth } = room.dimensions;
        if (!roomPositions[index]) {
          console.warn(`Missing room position at index ${index}`);
          return null;
        }

        const roomPos = roomPositions[index];
        const doorTiles = [];

        if (index > 0 && doorLinks[index - 1]?.doors?.to) {
          doorTiles.push(...doorLinks[index - 1].doors.to);
        }
        if (index < doorLinks.length && doorLinks[index]?.doors?.from) {
          doorTiles.push(...doorLinks[index].doors.from);
        }

        const interiorWallTiles = interiorWalls[index] || [];

        const groupedArtifacts = groupArtifacts(room.artifacts);
        const placedGroups = []; //placeArtifactsInRoom(groupedArtifacts, width, depth, doorTiles);

        const nextRoom = roomData[index + 1];
        const doorTilesFrom = doorLinks[index]?.doors?.from || [];

        let nextRoomInfo = null;
        if (doorTilesFrom.length && nextRoom) {
          nextRoomInfo = {
            doorTiles: doorTilesFrom,
            name: nextRoom.name,
            description: nextRoom.description,
          };
        }

        return (
          <group key={index}>
            <Room
              width={width}
              depth={depth}
              position={[roomPos.x, 0, roomPos.z]}
              doorTiles={doorTiles}
              interiorWallTiles={interiorWallTiles}
              nextRoomInfo={nextRoomInfo}
              index={index}
            />
            {placedGroups.map((group, i) => (
              <Showcase
                key={`group-${i}`}
                contents={group.contents}
                position={[
                  roomPos.x + group.position[0],
                  0,
                  roomPos.z + group.position[2],
                ]}
                rotation={[0, group.rotationY || 0, 0]}
                isWall={group.isWall}
              />
            ))}
          </group>
        );
      })}
    </group>
  );
};

export default MuseumLayout;
