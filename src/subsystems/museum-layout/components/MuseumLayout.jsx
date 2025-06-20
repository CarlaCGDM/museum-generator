import { useMemo } from 'react';
import Room from './rooms/Room';
import Showcase from '../../interactables/components/Showcase';
import { useDebug } from '../../debug/DebugContext';
import { createLogger } from '../../debug/utils/logger';
import { placeArtifactsInRoom } from '../utils/place-artifacts/placeArtifactsInRoom';
import { placeRailingsInRoom } from '../utils/place-artifacts/placeRailingsInRoom';
import { placeDoorwaysInRoom } from '../utils/place-artifacts/placeDoorwaysInRoom';
import Doorway from './decor/Doorway';
import SpotlightRailing from './decor/SpotlightRailing';

import { useMuseum } from './MuseumProvider';

function groupArtifacts(artifacts) {
  const grouped = new Map();
  for (const artifact of artifacts) {
    const key = artifact.group ?? `ungrouped-${artifact.id}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(artifact);
  }
  return [...grouped.values()];
}

const MuseumLayout = () => {
  const { roomData, roomPositions, roomDoorInfo } = useMuseum();

  const debugGenerateLayout = useDebug('Layout', 'generateRoomLayout');
  const logger = useMemo(() => createLogger(debugGenerateLayout, 'generateRoomLayout'), [debugGenerateLayout]);

  const interiorWalls = useMemo(() => {
    // Placeholder for future interior wall logic
    return roomData?.map(() => []) || [];
  }, [roomData]);

  if (!roomData || !roomPositions || roomData.length !== roomPositions.length) {
    return null;
  }

  return (
    <group>
      {roomData.map((room, index) => {
        const { width, depth } = room.dimensions;
        const roomPos = roomPositions[index];
        const { allDoorTiles, entranceTiles, exitTiles } = roomDoorInfo[index] || {
          allDoorTiles: [],
          entranceTiles: [],
          exitTiles: [],
        };

        const interiorWallTiles = interiorWalls[index] || [];

        const groupedArtifacts = groupArtifacts(room.artifacts);
        const placedGroups = placeArtifactsInRoom(groupedArtifacts, width, depth, allDoorTiles);

        const localRailings = placeRailingsInRoom(width, depth);

        const doorwayPlacements = placeDoorwaysInRoom(
          allDoorTiles,
          entranceTiles,
          exitTiles,
          1,
          width,
          depth
        );



        let nextRoomInfo = null;
        if (exitTiles.length && roomData[index + 1]) {
          const nextRoom = roomData[index + 1];
          nextRoomInfo = {
            doorTiles: exitTiles,
            name: nextRoom.name,
            subtitle: nextRoom.subtitle,
            topicName: nextRoom.topicName,
            topicId: nextRoom.topicId,
            indexInTopic: nextRoom.indexInTopic,
            totalIndexInTopic: nextRoom.totalIndexInTopic,
            description: nextRoom.description,
          };
        }

        const currentRoomInfo = {
          doorTiles: entranceTiles,
          name: room.name,
          subtitle: room.subtitle,
          topicName: room.topicName,
          topicId: room.topicId,
          indexInTopic: room.indexInTopic,
          totalIndexInTopic: room.totalIndexInTopic,
          description: room.description,
        };

        return (
          <group key={index}>
            <Room
              width={width}
              depth={depth}
              position={[roomPos.x, 0, roomPos.z]}
              doorTiles={allDoorTiles}
              interiorWallTiles={interiorWallTiles}
              nextRoomInfo={nextRoomInfo}
              currentRoomInfo={currentRoomInfo}
              index={index}
              roomDoorInfo={roomDoorInfo} // Pass the precomputed door info
            />
            {placedGroups.map((group, i) => (
              <Showcase
                key={`group-${i}`}
                index={index}
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

            {localRailings.map((rail, rIdx) => (
              <SpotlightRailing
                key={`railing-${index}-${rIdx}`}
                position={[
                  roomPos.x + rail.position[0],
                  0,
                  roomPos.z + rail.position[2],
                ]}
                rotation={rail.rotation}
                roomIndex={index}
              />
            ))}
            
            {doorwayPlacements.map((door) => (
              <Doorway
                key={`door-${door.id}`}
                direction={door.direction}
                positionOffset={[
                  roomPos.x + door.position[0],
                  door.position[1],
                  roomPos.z + door.position[2],
                ]}
              />
            ))}

          </group>
        );
      })}
    </group>
  );
};

export default MuseumLayout;