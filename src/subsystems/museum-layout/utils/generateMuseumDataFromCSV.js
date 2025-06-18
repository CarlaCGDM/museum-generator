import Papa from 'papaparse';

export async function generateMuseumDataFromCSV(
  artifactsCsvPath,
  groupsCsvPath,
  roomsCsvPath,
  topicsCsvPath
) {
  try {
    const [artifactsData, groupsData, roomsData, topicsData] = await Promise.all([
      readCSV(artifactsCsvPath),
      readCSV(groupsCsvPath),
      readCSV(roomsCsvPath),
      readCSV(topicsCsvPath)
    ]);

    const museum = { rooms: [], topic: [] };

    museum.topic = topicsData.map(topic => ({
      id: `topic-${topic.topic_id}`,
      name: topic.name.trim()
    }));

    museum.rooms = roomsData.map(room => {
      const roomId = parseInt(room.room_id);

      const roomArtifacts = artifactsData
        .filter(artifact => parseInt(artifact.room_id) === roomId)
        .map(artifact => ({
          id: parseInt(artifact.id),
          name: artifact.name.trim(),
          room: roomId,
          group: artifact.group_id.trim(),
          model_path: artifact.model_path.trim(),
          starred: artifact['starred (only floor)'].trim().toUpperCase() === 'TRUE',
          onWall: artifact.onWall.trim().toUpperCase() === 'TRUE'
        }));

      const roomGroups = groupsData
        .filter(group => parseInt(group.room_id) === roomId)
        .map(group => ({
          id: group.group_id.trim(),
          type: group.type.trim(),
          name: group.name.trim(),
          description: group.description.trim()
        }));

      const roomTopic = topicsData.find(topic => parseInt(topic.topic_id) === parseInt(room.topic_id));

      return {
        id: roomId,
        name: room.name.trim(),
        subtitle: room.subtitle.trim(),
        description: room.description.trim(),
        topicId: `topic-${room.topic_id}`,
        topicName: roomTopic ? roomTopic.name.trim() : `topic ${room.topic_id}`,
        groups: roomGroups,
        items: roomArtifacts
      };
    });

    return museum;
  } catch (error) {
    console.error('Error generating museum data from CSV:', error);
    return { rooms: [], topic: [] };
  }
}

async function readCSV(csvPath) {
  try {
    const response = await fetch(csvPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${csvPath}: ${response.status} ${response.statusText}`);
    }
    const csvData = await response.text();

    const parseResult = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      delimitersToGuess: [',', '\t', ';'],
      transformHeader: (header) => header.trim()
    });

    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing warnings:', parseResult.errors);
    }

    return parseResult.data;
  } catch (error) {
    console.error(`Error reading CSV file ${csvPath}:`, error);
    throw error;
  }
}
