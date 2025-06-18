import { useMemo } from 'react';
import Room from './rooms/Room';
import Showcase from '../../interactables/components/Showcase';
import { useDebug } from '../../debug/DebugContext';
import { createLogger } from '../../debug/utils/logger';
import { placeArtifactsInRoom } from '../utils/place-artifacts/placeArtifactsInRoom';
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
          </group>
        );
      })}
    </group>
  );
};

export default MuseumLayout;