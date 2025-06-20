export function placeRailingsInRoom(roomWidth, roomDepth, stripeSpacing = 4, tileSize = 1, stripeMargin = 2) {
  const isAlongWidth = roomWidth >= roomDepth;

  const stripeLength = (isAlongWidth ? roomWidth : roomDepth) - stripeMargin * 2;
  const stripeAxisLength = isAlongWidth ? roomDepth : roomWidth;

  // Calculate how many full stripes we can fit (min 2), then center them
  const stripeCount = Math.max(2, Math.floor(stripeAxisLength / stripeSpacing));
  const totalStripeSpan = (stripeCount - 1) * stripeSpacing;
  const stripeStart = -totalStripeSpan / 2;

  const railings = [];

  for (let stripe = 0; stripe < stripeCount; stripe++) {
    const stripeCoord = stripeStart + stripe * stripeSpacing;

    // Place railings across the stripe, skipping margins
    const startCoord = -(stripeLength / 2);
    const railingCount = Math.floor(stripeLength / tileSize);

    for (let i = 0; i < railingCount; i++) {
      const tileCoord = startCoord + i * tileSize;

      const position = isAlongWidth
        ? [tileCoord, 0, stripeCoord] // horizontal stripe
        : [stripeCoord, 0, tileCoord]; // vertical stripe

      const rotation = isAlongWidth
        ? [0, 0, 0]
        : [0, Math.PI / 2, 0];

      railings.push({ position, rotation });
    }
  }

  return railings;
}
