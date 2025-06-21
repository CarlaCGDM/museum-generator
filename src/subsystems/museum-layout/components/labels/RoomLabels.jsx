import FloorLabelPlane from './FloorLabelPlane';
import EntranceDoorLabelPlane from './EntranceDoorLabelPlane';
import ExitDoorLabelPlane from './ExitDoorLabelPlane';

const topicColors = [
  '#DE9393', '#DC997C', '#ECBF87', '#D0BF6A',
  '#C0C57C', '#A7C585', '#87C7AD', '#76B8BD',
  '#8C9ACA', '#B295CB', '#C691C4'
];

function getTopicColor(topicId) {
  const num = parseInt(topicId?.split('-').pop()) || 0;
  return topicColors[num % topicColors.length];
}

const getWallRotationAndPosition = (doorTiles, width, depth) => {
  if (!doorTiles || doorTiles.length === 0) return null;
  const allX = doorTiles.map(t => t.x);
  const allZ = doorTiles.map(t => t.z);

  let wallRotation = 0;
  let wallNormalX = 0, wallNormalZ = 0;

  if (new Set(allX).size === 1) {
    const x = allX[0];
    wallRotation = x === 0 ? Math.PI / 2 : -Math.PI / 2;
    wallNormalX = x === 0 ? -1 : 1;
  } else if (new Set(allZ).size === 1) {
    const z = allZ[0];
    wallRotation = z === 0 ? 0 : Math.PI;
    wallNormalZ = z === 0 ? -1 : 1;
  }

  return { wallRotation, wallNormalX, wallNormalZ };
};

const calculateLabelPosition = (midTile, doorTiles, width, depth, xOffset, zOffset, tileSize) => {
  const wallInfo = getWallRotationAndPosition(doorTiles, width, depth);
  if (!wallInfo) return [xOffset + midTile.x * tileSize, 2.5, zOffset + midTile.z * tileSize];

  const { wallNormalX, wallNormalZ } = wallInfo;
  const sideDirectionX = -wallNormalZ;
  const sideDirectionZ = wallNormalX;
  const wallOffset = 0;
  const sideOffset = 3.5;

  return [
    xOffset + midTile.x * tileSize + (wallNormalX * wallOffset) + (sideDirectionX * sideOffset),
    2.5,
    zOffset + midTile.z * tileSize + (wallNormalZ * wallOffset) + (sideDirectionZ * sideOffset),
  ];
};

const RoomLabels = ({
  width,
  depth,
  tileSize,
  xOffset,
  zOffset,
  nextRoomInfo,
  currentRoomInfo,
  roomDoorInfo,
  roomIndex,
}) => {

  const currentRoomColor = currentRoomInfo ? getTopicColor(currentRoomInfo.topicId) : null;
  const nextRoomColor = nextRoomInfo ? getTopicColor(nextRoomInfo.topicId) : null;

  const {
    entranceTiles = [],
    exitTiles = [],
    allDoorTiles = [],
    entranceMid,
    exitMid
  } = roomDoorInfo[roomIndex] || {};

  return (
    <group>

      {/* Entrance Label */}
      {currentRoomInfo && entranceTiles.length > 0 && entranceMid && (
        <EntranceDoorLabelPlane
          key="entrance-door-label"
          position={calculateLabelPosition(entranceMid, entranceTiles, width, depth, xOffset, zOffset, tileSize)}
          rotationY={getWallRotationAndPosition(entranceTiles, width, depth)?.wallRotation || 0}
          topicColor={currentRoomColor}
          {...currentRoomInfo}
        />
      )}

      {/* Exit Label */}
      {nextRoomInfo && exitTiles.length > 0 && exitMid && (
        <ExitDoorLabelPlane
          key="exit-door-label"
          position={calculateLabelPosition(exitMid, exitTiles, width, depth, xOffset, zOffset, tileSize)}
          rotationY={getWallRotationAndPosition(exitTiles, width, depth)?.wallRotation || 0}
          topicColor={nextRoomColor}
          {...nextRoomInfo}
        />
      )}

      <FloorLabelPlane
        width={width}
        depth={depth}
        tileSize={tileSize}
        xOffset={xOffset}
        zOffset={zOffset}
        currentRoomColor={currentRoomColor}
        nextRoomColor={nextRoomColor}
        roomDoorInfoEntry={roomDoorInfo[roomIndex]} // ✅ Pass this!
      />

    </group>
  );
};

export default RoomLabels;