export function printTileMap(tileSet, width, depth, marker = '▓') {
  let output = '';

  for (let z = 0; z < depth; z++) {
    for (let x = 0; x < width; x++) {
      const key = `${x},${z}`;
      output += tileSet.has(key) ? marker : '·';
    }
    output += '\n';
  }

  console.log(output);
}
