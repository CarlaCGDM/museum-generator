import { useMemo } from 'react';
import Room from './rooms/Room';
import Showcase from '../../interactables/components/Showcase';
import { useDebug } from '../../debug/DebugContext';
import { createLogger } from '../../debug/utils/logger';
import { placeArtifactsInRoom } from '../utils/place-artifacts/placeArtifactsInRoom';
import { placeRailingsInRoom } from '../utils/place-artifacts/placeRailingsInRoom';
import { placeDoorwaysInRoom } from '../utils/place-artifacts/placeDoorwaysInRoom';
import { placePlantsInRoom } from '../utils/place-artifacts/placePlantsInRoom';
import { placeStaticPeopleInRoom } from '../utils/place-artifacts/placeStaticPeopleInRoom';
import Doorway from './decor/Doorway';
import SpotlightRailing from './decor/SpotlightRailing';
import PottedPlant from './decor/PottedPlant';
import Bench from './decor/Bench';
import StaticPerson from './decor/StaticPerson';
import React from 'react';

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

        const plantPositions = placePlantsInRoom(width, depth);
        const peoplePositions = placeStaticPeopleInRoom(width, depth);




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

            {doorwayPlacements.map((door) => {
              const [x, y, z] = [
                roomPos.x + door.position[0],
                door.position[1],
                roomPos.z + door.position[2],
              ];

              // Offset 3 meters to the right based on direction
              const offsetMap = {
                north: [-3.5, 0, -0.5],
                south: [3.5, 0, 0.5],
                east: [-0.5, 0, 3.5],
                west: [0.5, 0, -3.5],
              };

              const offset = offsetMap[door.direction] || [0, 0, 0];

              const benchPosition = [
                x + offset[0],
                y + offset[1],
                z + offset[2],
              ];

              return (
                <React.Fragment key={`door-bench-${door.id}`}>
                  <Doorway
                    direction={door.direction}
                    positionOffset={[x, y, z]}
                  />
                  <Bench
                    direction={door.direction}
                    position={benchPosition}
                  />
                </React.Fragment>
              );
            })}

            {plantPositions.map((pos, pIdx) => (
              <PottedPlant
                key={`plant-${index}-${pIdx}`}
                position={[
                  roomPos.x + pos[0],
                  pos[1],
                  roomPos.z + pos[2],
                ]}
              />
            ))}

            {peoplePositions.map((pos, pIdx) => (
              <StaticPerson
                key={`person-${index}-${pIdx}`}
                roomIndex={index}
                personIndex={pIdx}
                position={[
                  roomPos.x + pos[0],
                  pos[1],
                  roomPos.z + pos[2],
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