import { useMemo } from 'react';
import Room from './Room';
import Showcase from '../../interactables/components/Showcase';
import { generateRoomLayout } from '../utils/generate-room/generateRoomLayout';
import { useDebug } from '../../debug/DebugContext';
import { createLogger } from '../../debug/utils/logger';
import { placeArtifactsInRoom } from '../utils/place-artifacts/placeArtifactsInRoom';

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

const MuseumLayout = ({ roomData }) => {
  const debugGenerateLayout = useDebug('Layout', 'generateRoomLayout');
  const logger = useMemo(() => createLogger(debugGenerateLayout, 'generateRoomLayout'), [debugGenerateLayout]);

  const roomDefinitions = roomData.map(room => ({
    width: room.dimensions.width,
    depth: room.dimensions.depth,

  }));

  const { roomPositions, doorLinks, interiorWalls } = useMemo(() => {
    const layout = generateRoomLayout(roomDefinitions, 1, logger);

    // Room 0 position and size
    const firstRoomPos = layout.roomPositions[0];
    const firstRoomSize = roomDefinitions[0];

    // Calculate center of room 0 (assuming roomPos is corner, usually top-left or bottom-left)
    const centerOffsetX = firstRoomPos.x + firstRoomSize.width / 2;
    const centerOffsetZ = firstRoomPos.z + firstRoomSize.depth / 2;

    // Offset all room positions so room 0 center is at origin
    const centeredPositions = layout.roomPositions.map(pos => ({
      x: pos.x - centerOffsetX * 0.5,
      z: pos.z - centerOffsetZ * 0.5,
    }));

    return {
      ...layout,
      roomPositions: centeredPositions,
    };
  }, [roomDefinitions, logger]);


  return (
    <group>
      {roomData.map((room, index) => {
        const { width, depth } = room.dimensions;
        if (!roomPositions[index]) {
          console.warn(`Missing room position at index ${index}`);
          return null; // skip rendering this room to avoid crash
        }
        const roomPos = roomPositions[index];
        const doorTiles = [];

        if (index > 0 && doorLinks[index - 1]?.doors?.to) {
          doorTiles.push(...doorLinks[index - 1].doors.to);
        }
        if (index < doorLinks.length && doorLinks[index]?.doors?.from) {
          doorTiles.push(...doorLinks[index].doors.from);
        }

        //console.log(doorTiles)

        const interiorWallTiles = interiorWalls[index] || [];

        // 🧠 Group artifacts by group ID
        const groupedArtifacts = groupArtifacts(room.artifacts);
        const placedGroups = []; //placeArtifactsInRoom(groupedArtifacts, width, depth, doorTiles);

        const nextRoom = roomData[index + 1];
        const doorTilesFrom = doorLinks[index]?.doors?.from || [];

        let nextRoomInfo = null;
        if (doorTilesFrom.length && nextRoom) {
          nextRoomInfo = {
            doorTiles: doorTilesFrom,
            name: nextRoom.name,
            description: nextRoom.description
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
              nextRoomInfo={nextRoomInfo}  // <- Add this prop
              index={index}
            />

            {/* 🔍 Render grouped showcases */}
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
