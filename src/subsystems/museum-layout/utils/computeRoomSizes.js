// utils/RoomCalculator.js
import { loadModel, calculateModelDimensions } from './ModelLoader';

export async function computeRoomSizes(museumData, log = () => { }) {

  // 1. Group rooms by topicId
  const roomsByTopic = new Map();
  for (const room of museumData.rooms) {
    if (!roomsByTopic.has(room.topicId)) {
      roomsByTopic.set(room.topicId, []);
    }
    roomsByTopic.get(room.topicId).push(room);
  }

  // 2. Sort rooms per topic and inject indexes
  for (const [_, rooms] of roomsByTopic) {
    rooms.sort((a, b) => a.id - b.id); // or any consistent ordering
    rooms.forEach((room, index) => {
      room.indexInTopic = index + 1; // 1-based
      room.totalIndexInTopic = rooms.length;
    });
  }

  const roomReports = [];

  for (const room of museumData.rooms) {
    let totalArea = 0;
    const artifactDimensions = [];

    log(`📦 Processing room: ${room.name} (${room.id}) with ${room.items.length} artifacts`);

    const loadPromises = room.items.map(async (artifact) => {
      try {
        //const model = await loadModel(`models/exhibits/${artifact.model_path}`);
        const model = await loadModel(`models/artifacts/${artifact.model_path}/LOD_00.glb`);
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

    // NEW CALCULATION: Based on wall capacity for non-starred artifacts
    const nonStarredArtifacts = artifactDimensions.filter(artifact => !artifact.starred);

    // Calculate total wall length needed (sum of artifact widths)
    const totalWallLengthNeeded = nonStarredArtifacts.reduce((sum, artifact) => {
      return sum + Math.ceil(artifact.dimensions.width); // Round up to nearest tile
    }, 0);

    log(`  📏 Total wall length needed: ${totalWallLengthNeeded} tiles`);

    // Add buffer for spacing between artifacts (1 tile between each group)
    const numArtifactGroups = nonStarredArtifacts.length; // Assuming each artifact is its own group for now
    const spacingBuffer = Math.max(0, numArtifactGroups - 1); // One space between each group
    const totalWallLengthWithSpacing = (totalWallLengthNeeded + spacingBuffer) * 3;

    log(`  📏 Total wall length with spacing: ${totalWallLengthWithSpacing} tiles`);

    // Reserve space for doors and labels
    // Assume 2 doors max, each door takes 1 tile + 1 padding on each side = 3 tiles per door
    // Plus 2 tiles for entrance label + 2 tiles for exit label = 4 tiles for labels
    const reservedTiles = (2 * 3) + 4; // 6 for doors + 4 for labels = 10 tiles reserved

    // Total perimeter needed = wall artifacts + spacing + reserved space
    const totalPerimeterNeeded = totalWallLengthWithSpacing + reservedTiles;

    log(`  📏 Total perimeter needed (including reserves): ${totalPerimeterNeeded} tiles`);

    // Find room dimensions that provide this perimeter
    // Perimeter = 2 * (width + depth) - 4 (corners don't count)
    // So: totalPerimeterNeeded = 2 * (width + depth) - 4
    // Rearranging: width + depth = (totalPerimeterNeeded + 4) / 2

    const sumOfDimensions = Math.ceil((totalPerimeterNeeded + 4) / 2);

    // Try to make room roughly square, but allow some variation
    let width, depth;

    if (Math.random() > 0.5) {
      // Width-first approach
      width = Math.ceil(sumOfDimensions / 2);
      depth = sumOfDimensions - width;
    } else {
      // Depth-first approach  
      depth = Math.ceil(sumOfDimensions / 2);
      width = sumOfDimensions - depth;
    }

    // Ensure minimum room size (at least 13x13 for walking space)
    width = Math.max(13, width);
    depth = Math.max(13, depth);

    // Recalculate the other dimension if one was increased to minimum
    if (width === 13 && depth < 13) {
      depth = Math.max(13, sumOfDimensions - width);
    } else if (depth === 13 && width < 13) {
      width = Math.max(13, sumOfDimensions - depth);
    }

    // Ensure odd numbers (for proper centering)
    width = width % 2 === 0 ? width + 1 : width;
    depth = depth % 2 === 0 ? depth + 1 : depth;

    // Safety check for NaN values
    if (isNaN(width) || isNaN(depth)) {
      log(`⚠️ Warning: NaN detected for room ${room.name}, using fallback dimensions`);
      width = 13;  // fallback odd number
      depth = 13;  // fallback odd number
    }

    // NEW: Scale room based on starred items requirements
    const starredArtifacts = artifactDimensions.filter(artifact => artifact.starred);

    // Replace the starred items scaling logic with this:

    if (starredArtifacts.length > 0) {
      log(`  ⭐ Analyzing ${starredArtifacts.length} starred artifacts for floor space`);

      // Calculate total area needed for starred items (sum of all areas)
      const totalStarredArea = starredArtifacts.reduce((sum, artifact) => sum + artifact.dimensions.area, 0);

      // Calculate the maximum single dimension needed (for any single artifact)
      const maxArtifactWidth = Math.max(...starredArtifacts.map(a => Math.ceil(a.dimensions.width)));
      const maxArtifactDepth = Math.max(...starredArtifacts.map(a => Math.ceil(a.dimensions.depth)));

      // Calculate minimum square area needed (with 1 tile spacing between items)
      const itemsPerRow = Math.ceil(Math.sqrt(starredArtifacts.length));
      const minRequiredWidth = itemsPerRow * maxArtifactWidth + (itemsPerRow - 1);
      const minRequiredDepth = itemsPerRow * maxArtifactDepth + (itemsPerRow - 1);

      // Apply breathing room factor (want starred area to be ≤ 1/5 of room)
      const BREATHING_ROOM_FACTOR = 5;
      const breathingRoomWidth = minRequiredWidth * BREATHING_ROOM_FACTOR;
      const breathingRoomDepth = minRequiredDepth * BREATHING_ROOM_FACTOR;

      log(`  📐 Starred items arrangement: ${itemsPerRow}x${itemsPerRow} grid`);
      log(`  📏 Minimum required space: ${minRequiredWidth}x${minRequiredDepth}`);
      log(`  🏗️  Required room size: ${breathingRoomWidth}x${breathingRoomDepth}`);

      // Ensure room is large enough for this arrangement
      if (width < breathingRoomWidth) {
        log(`  📈 Scaling width from ${width} to ${breathingRoomWidth}`);
        width = breathingRoomWidth;
      }

      if (depth < breathingRoomDepth) {
        log(`  📈 Scaling depth from ${depth} to ${breathingRoomDepth}`);
        depth = breathingRoomDepth;
      }

      // Ensure odd dimensions
      width = width % 2 === 0 ? width + 1 : width;
      depth = depth % 2 === 0 ? depth + 1 : depth;

      //width *= 2;
      //depth *= 2;

      log(`  ✅ Final room size: ${width}x${depth}`);
    }
    // Verify we have enough perimeter (recalculate after potential scaling)
    const actualPerimeter = 2 * (width + depth) - 4;
    const availableWallSpace = actualPerimeter - reservedTiles;

    log(`  📐 Final room size: ${width}x${depth}m for ${room.name}`);
    log(`  📏 Actual perimeter: ${actualPerimeter} tiles`);
    log(`  📏 Available wall space: ${availableWallSpace} tiles`);
    log(`  📏 Required wall space: ${totalWallLengthWithSpacing} tiles`);

    if (availableWallSpace < totalWallLengthWithSpacing) {
      log(`  ⚠️ Warning: Not enough wall space! Need ${totalWallLengthWithSpacing} but only have ${availableWallSpace}`);
    } else {
      log(`  ✅ Sufficient wall space available`);
    }

    roomReports.push({
      id: room.id,
      name: room.name,
      subtitle: room.subtitle,
      description: room.description,
      topicId: room.topicId,
      topicName: room.topicName,
      indexInTopic: room.indexInTopic,
      totalIndexInTopic: room.totalIndexInTopic,
      artifactCount: room.items.length,
      totalArtifactArea: totalArea,
      roomArea: width * depth, // Update this to actual room area
      dimensions: { width, depth },
      artifacts: artifactDimensions,
      // Add new debug info
      wallAnalysis: {
        nonStarredCount: nonStarredArtifacts.length,
        totalWallLengthNeeded,
        totalWallLengthWithSpacing,
        reservedTiles,
        totalPerimeterNeeded,
        actualPerimeter,
        availableWallSpace,
        hasEnoughSpace: availableWallSpace >= totalWallLengthWithSpacing
      },
      // Add starred items analysis
      starredAnalysis: {
        starredCount: starredArtifacts.length,
        totalStarredArea: starredArtifacts.reduce((sum, artifact) => sum + artifact.dimensions.area, 0),
        maxAllowedFloorWidth: Math.floor(width / 4),
        maxAllowedFloorDepth: Math.floor(depth / 4),
        roomWasScaled: starredArtifacts.length > 0 // This could be enhanced to track actual scaling
      }
    });
  }

  log(` 📝 Complete rooms report:`);
  log(roomReports);

  return roomReports;
}