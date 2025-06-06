// utils/place-artifacts/placeCenterArtifacts.js

export function placeCenterArtifacts(starredGroups, roomWidth, roomDepth) {
  if (!starredGroups || starredGroups.length === 0) {
    return [];
  }

  const placed = [];
  const centerX = 0; // Room center in local coordinates
  const centerZ = 0;
  
  // Flatten groups into individual artifacts and sort by size (biggest first)
  const starredArtifacts = starredGroups
    .flat()
    .sort((a, b) => (b.dimensions.width * b.dimensions.depth) - (a.dimensions.width * a.dimensions.depth));

  const count = starredArtifacts.length;

  if (count === 1) {
    // Single artifact: dead center
    placed.push({
      contents: [starredArtifacts[0]],
      position: [centerX, 0, centerZ],
      rotationY: 0,
      isWall: false,
    });

  } else if (count === 2) {
    // Two artifacts: side by side horizontally
    const spacing = 3; // tiles between them
    placed.push({
      contents: [starredArtifacts[0]],
      position: [centerX - spacing/2, 0, centerZ],
      rotationY: 0,
      isWall: false,
    });
    placed.push({
      contents: [starredArtifacts[1]],
      position: [centerX + spacing/2, 0, centerZ],
      rotationY: 0,
      isWall: false,
    });

  } else if (count === 3) {
    // Three artifacts: biggest in center, other two flanking it
    const spacing = 3;
    placed.push({
      contents: [starredArtifacts[0]], // biggest in center
      position: [centerX, 0, centerZ],
      rotationY: 0,
      isWall: false,
    });
    placed.push({
      contents: [starredArtifacts[1]],
      position: [centerX - spacing, 0, centerZ],
      rotationY: 0,
      isWall: false,
    });
    placed.push({
      contents: [starredArtifacts[2]],
      position: [centerX + spacing, 0, centerZ],
      rotationY: 0,
      isWall: false,
    });

  } else if (count === 4) {
    // Four artifacts: cross pattern with biggest in center
    const spacing = 3;
    placed.push({
      contents: [starredArtifacts[0]], // biggest in center
      position: [centerX, 0, centerZ],
      rotationY: 0,
      isWall: false,
    });
    placed.push({
      contents: [starredArtifacts[1]], // north
      position: [centerX, 0, centerZ - spacing],
      rotationY: 0,
      isWall: false,
    });
    placed.push({
      contents: [starredArtifacts[2]], // east
      position: [centerX + spacing, 0, centerZ],
      rotationY: 0,
      isWall: false,
    });
    placed.push({
      contents: [starredArtifacts[3]], // south
      position: [centerX, 0, centerZ + spacing],
      rotationY: 0,
      isWall: false,
    });

  } else if (count === 5) {
    // Five artifacts: biggest in center, others at cardinal directions
    const spacing = 3;
    placed.push({
      contents: [starredArtifacts[0]], // biggest in center
      position: [centerX, 0, centerZ],
      rotationY: 0,
      isWall: false,
    });
    placed.push({
      contents: [starredArtifacts[1]], // north
      position: [centerX, 0, centerZ - spacing],
      rotationY: 0,
      isWall: false,
    });
    placed.push({
      contents: [starredArtifacts[2]], // east
      position: [centerX + spacing, 0, centerZ],
      rotationY: 0,
      isWall: false,
    });
    placed.push({
      contents: [starredArtifacts[3]], // south
      position: [centerX, 0, centerZ + spacing],
      rotationY: 0,
      isWall: false,
    });
    placed.push({
      contents: [starredArtifacts[4]], // west
      position: [centerX - spacing, 0, centerZ],
      rotationY: 0,
      isWall: false,
    });
  }

  return placed;
}