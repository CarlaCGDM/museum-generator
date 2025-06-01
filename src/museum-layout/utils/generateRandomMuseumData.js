import { v4 as uuidv4 } from 'uuid';

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chance = (percent) => Math.random() < percent / 100;

export function generateRandomMuseumData(totalItems = 100) {
  const museum = { rooms: [], topic: [] };

  const numtopic = randomInt(2, 5);
  const numRooms = randomInt(3, 10);

  // Create topic names like "Topic 1", "Topic 2"...
  for (let i = 0; i < numtopic; i++) {
    museum.topic.push({
      id: `topic-${i + 1}`,
      name: `topic ${i + 1}`,
    });
  }

  // Distribute totalItems randomly among rooms
  let remainingItems = totalItems;
  const itemCounts = Array(numRooms).fill(0).map((_, i) => {
    if (i === numRooms - 1) return remainingItems;
    const maxPossible = Math.min(remainingItems, 20);
    const count = randomInt(1, maxPossible);
    remainingItems -= count;
    return count;
  });

    let itemId = 1;
  let topicIndex = 1; // Start from 1 because 0 is reserved for Room 0
  let currentTopicRoomCount = 0;
  const maxRoomsPerTopic = Math.ceil((numRooms - 1) / museum.topic.length); // approximate block size

  itemCounts.forEach((count, roomIndex) => {
    const roomId = roomIndex + 1;
    let topic;

    if (roomIndex === 0) {
      topic = { id: 'topic-0', name: 'topic 0' }; // Room 0 gets topic-0
    } else {
      if (currentTopicRoomCount >= maxRoomsPerTopic && topicIndex < museum.topic.length) {
        topicIndex++;
        currentTopicRoomCount = 0;
      }
      topic = museum.topic[topicIndex - 1]; // topicIndex is 1-based
      currentTopicRoomCount++;
    }

    // star, group logic remains unchanged
    const starredIndexes = new Set();
    const numStarred = randomInt(0, Math.min(5, count));
    while (starredIndexes.size < numStarred) {
      starredIndexes.add(randomInt(0, count - 1));
    }

    const wallIndexes = [];
    const floorIndexes = [];
    for (let i = 0; i < count; i++) {
      (chance(30) ? wallIndexes : floorIndexes).push(i);
    }

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

      for (const idx of available) {
        assignments.set(idx, `${roomId}-${type}-solo-${idx}`);
      }

      return assignments;
    };

    const wallAssignments = assignGroups(wallIndexes, 'wall');
    const floorAssignments = assignGroups(floorIndexes, 'floor');

    const items = [];

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
      topicId: topic.id,
      topicName: topic.name,
      groups: [],
      items,
    });
  });

  console.log(museum)
  return museum;
}
