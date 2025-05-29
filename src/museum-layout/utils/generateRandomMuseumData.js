import { v4 as uuidv4 } from 'uuid';

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chance = (percent) => Math.random() < percent / 100;

export function generateRandomMuseumData(totalItems = 100) {
  const museum = { rooms: [] };

  const numRooms = randomInt(1, 10);

  // Distribute totalItems randomly among rooms, ensuring sum = totalItems
  let remainingItems = totalItems;
  const itemCounts = Array(numRooms).fill(0).map((_, i) => {
    if (i === numRooms - 1) return remainingItems;
    const maxPossible = Math.min(remainingItems, 20);
    const count = randomInt(1, maxPossible);
    remainingItems -= count;
    return count;
  });

  let itemId = 1;

  itemCounts.forEach((count, roomIndex) => {
    const roomId = roomIndex + 1;

    // Pick 0–5 random indexes to star
    const starredIndexes = new Set();
    const numStarred = randomInt(0, Math.min(5, count));
    while (starredIndexes.size < numStarred) {
      starredIndexes.add(randomInt(0, count - 1));
    }

    const items = [];

    // Decide which indexes will be wall-mounted
    const wallIndexes = [];
    const floorIndexes = [];

    for (let i = 0; i < count; i++) {
      (chance(30) ? wallIndexes : floorIndexes).push(i);
    }

    // Utility to assign group IDs
    const assignGroups = (indexes, type = 'group') => {
      const assignments = new Map();
      const numGroups = randomInt(0, Math.floor(indexes.length / 3));
      let currentGroupId = 1;
      const available = [...indexes];

      for (let g = 0; g < numGroups; g++) {
        const groupSize = randomInt(2, Math.min(4, available.length));
        const groupMembers = [];

        for (let j = 0; j < groupSize; j++) {
          const randIdx = randomInt(0, available.length - 1);
          groupMembers.push(available[randIdx]);
          available.splice(randIdx, 1);
        }

        for (const idx of groupMembers) {
          assignments.set(idx, `${roomId}-${type}-${currentGroupId}`);
        }

        currentGroupId++;
      }

      // Remaining get their own group
      for (const idx of available) {
        assignments.set(idx, `${roomId}-${type}-solo-${idx}`);
      }

      return assignments;
    };

    const wallAssignments = assignGroups(wallIndexes, 'wall');
    const floorAssignments = assignGroups(floorIndexes, 'floor');

    for (let i = 0; i < count; i++) {
      const isStarred = starredIndexes.has(i);
      const onWall = wallIndexes.includes(i);
      const modelNumber = String(itemId).padStart(3, '0');

      const groupId = onWall ? wallAssignments.get(i) : floorAssignments.get(i);

      items.push({
        id: itemId,
        room: roomId,
        group: groupId,
        model_path: `Cube_${modelNumber}.glb`,
        starred: isStarred,
        onWall,
      });

      itemId++;
    }

    museum.rooms.push({
      id: roomId,
      name: `Room ${roomId - 1}`,
      description: `Room containing ${count} items`,
      groups: [], // group metadata can be added later if needed
      items,
    });
  });

  return museum;
}
