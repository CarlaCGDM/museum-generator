const entryRotationMap = {
  north: Math.PI,
  south: 0,
  east: Math.PI / 2,
  west: -Math.PI / 2,
};

export function placeFloorArtifacts(floorGroups, roomWidth, roomDepth, spacing, entryWall) {
  const placed = [];

  // Arrange into rows to fit room width
  const maxRowWidth = roomWidth - spacing * 2;
  const rows = [];
  let currentRow = [];
  let currentRowWidth = 0;

  for (const group of floorGroups) {
    const groupWidth = group.reduce((sum, item) => sum + item.dimensions.width, 0);
    const groupWidthWithSpacing = groupWidth + spacing;

    if (currentRowWidth + groupWidthWithSpacing > maxRowWidth && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
      currentRowWidth = 0;
    }

    currentRow.push({ group, groupWidth });
    currentRowWidth += groupWidthWithSpacing;
  }
  if (currentRow.length > 0) rows.push(currentRow);

  // Compute vertical spacing between rows
  const totalContentDepth = rows.reduce((sum, row) => {
    const rowDepth = Math.max(...row.map(r => Math.max(...r.group.map(item => item.dimensions.depth))));
    return sum + rowDepth;
  }, 0);
  const rowSpacing = (roomDepth - totalContentDepth) / (rows.length + 1);

  // Place each group in rows centered horizontally, rows spaced vertically
  let zCursor = -roomDepth / 2 + rowSpacing;

  for (const row of rows) {
    const rowWidth = row.reduce((sum, { groupWidth }) => sum + groupWidth + spacing, -spacing);
    let xCursor = -rowWidth / 2;

    const rowMaxDepth = Math.max(...row.map(r => Math.max(...r.group.map(item => item.dimensions.depth))));
    zCursor += rowMaxDepth / 2;

    for (const { group, groupWidth } of row) {
      placed.push({
        contents: group,
        position: [xCursor + groupWidth / 2, 0, zCursor],
        rotationY: entryRotationMap[entryWall] || 0,
        isWall: false,
      });

      xCursor += groupWidth + spacing;
    }

    zCursor += rowMaxDepth / 2 + rowSpacing;
  }

  return placed;
}
