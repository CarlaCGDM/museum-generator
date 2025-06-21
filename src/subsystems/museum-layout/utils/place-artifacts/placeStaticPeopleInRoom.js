// components/museum/utils/place-artifacts/placeStaticPeopleInRoom.js
export function placeStaticPeopleInRoom(roomWidth, roomDepth) {
  const margin = 3;
  const usableWidth = roomWidth - 2 * margin;
  const usableDepth = roomDepth - 2 * margin;

  const area = usableWidth * usableDepth;
  const numPeople = Math.min(9, Math.floor(area / 50 * 2)); // e.g. 10x10 room → 2 people

  const positions = [];
  const y = 0;

  for (let i = 0; i < numPeople; i++) {
    const x = (Math.random() * usableWidth + margin - (roomWidth - 1) / 2);
    const z = (Math.random() * usableDepth + margin - (roomDepth - 1) / 2);
    positions.push([x, y, z]);
  }

  return positions;
}
