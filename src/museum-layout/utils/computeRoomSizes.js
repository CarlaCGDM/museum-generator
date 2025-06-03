// utils/RoomCalculator.js
import { loadModel, calculateModelDimensions } from './ModelLoader';

export async function computeRoomSizes(museumData, log = () => { }) {
  const roomReports = [];

  for (const room of museumData.rooms) {
    let totalArea = 0;
    const artifactDimensions = [];

    log(`📦 Processing room: ${room.name} (${room.id}) with ${room.items.length} artifacts`);

    const loadPromises = room.items.map(async (artifact) => {
      try {
        const model = await loadModel(`models/exhibits/${artifact.model_path}`);
        const dimensions = calculateModelDimensions(model);
        log(`  ✔ Loaded ${artifact.model_path} → Area: ${dimensions.area.toFixed(2)}m²`);
        return {
          id: artifact.id,
          dimensions: {
            width: dimensions.width,
            depth: dimensions.depth,
            height: dimensions.height,
            area: dimensions.area,
          },
          // Enrich with metadata we want to track
          onWall: artifact.onWall ?? false,
          starred: artifact.starred ?? false,
          group: artifact.group ?? null,
          model_path: artifact.model_path,
        };
      } catch (error) {
        log(`  ✖ Failed to load ${artifact.model_path}:`, error);
        return {
          id: artifact.id,
          dimensions: {
            width: 1,
            depth: 1,
            height: 1,
            area: 1,
          },
          onWall: artifact.onWall ?? false,
          starred: artifact.starred ?? false,
          group: artifact.group ?? null,
          model_path: artifact.model_path,
        };
      }
    });

    const results = await Promise.all(loadPromises);

    results.forEach((artifact) => {
      artifactDimensions.push(artifact);
      totalArea += artifact.dimensions.area;
    });

    const roomArea = totalArea * 15;
    const baseSize = Math.ceil(Math.sqrt(roomArea));

    let width, depth;
    if (Math.random() > 0.5) {
      width = baseSize;
      depth = Math.max(2, Math.ceil(roomArea / width));
      if (width / depth > 2) depth = Math.ceil(width / 2);
    } else {
      depth = baseSize;
      width = Math.max(2, Math.ceil(roomArea / depth));
      if (depth / width > 2) width = Math.ceil(depth / 2);
    }

    // Ensure rooms are at least 5x5 tiles
    width = Math.max(13, width);
    depth = Math.max(13, depth);

    // FIXED: Ensure odd numbers (correct way)
    width = width % 2 === 0 ? width + 1 : width;   // If even, make odd
    depth = depth % 2 === 0 ? depth + 1 : depth;   // If even, make odd

    // Safety check for NaN values
    if (isNaN(width) || isNaN(depth)) {
      log(`⚠️ Warning: NaN detected for room ${room.name}, using fallback dimensions`);
      width = 13;  // fallback odd number
      depth = 13;  // fallback odd number
    }

    log(`  📐 Final room size: ${width}x${depth}m for ${room.name}`);

    roomReports.push({
      id: room.id,
      name: room.name,
      description: room.description,
      topicId: room.topicId,
      topicName: room.topicName,
      artifactCount: room.items.length,
      totalArtifactArea: totalArea,
      roomArea,
      dimensions: { width, depth },
      artifacts: artifactDimensions,
    });
  }

  log(` 📝 Complete rooms report:`);
  log(roomReports);

  return roomReports;
}