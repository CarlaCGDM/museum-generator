import { describe, it, expect } from 'vitest';
import { getCorridorTiles } from '../getCorridorTiles.js';
import { printTileMap } from './printTileMap.js';

const width = 9;
const depth = 9;
const halfX = Math.floor(width / 2);
const halfZ = Math.floor(depth / 2);

describe('getCorridorTiles - visual map for each wall', () => {
  it('from west wall', () => {
    const doors = [{ x: 0, z: halfZ }];
    const tiles = getCorridorTiles(doors, width, depth);
    printTileMap(tiles, width, depth, 'W');
    expect(tiles.has(`${halfX},${halfZ}`)).toBe(true);
  });

  it('from east wall', () => {
    const doors = [{ x: width - 1, z: halfZ }];
    const tiles = getCorridorTiles(doors, width, depth);
    printTileMap(tiles, width, depth, 'E');
    expect(tiles.has(`${halfX},${halfZ}`)).toBe(true);
  });

  it('from north wall', () => {
    const doors = [{ x: halfX, z: 0 }];
    const tiles = getCorridorTiles(doors, width, depth);
    printTileMap(tiles, width, depth, 'N');
    expect(tiles.has(`${halfX},${halfZ}`)).toBe(true);
  });

  it('from south wall', () => {
    const doors = [{ x: halfX, z: depth - 1 }];
    const tiles = getCorridorTiles(doors, width, depth);
    printTileMap(tiles, width, depth, 'S');
    expect(tiles.has(`${halfX},${halfZ}`)).toBe(true);
  });

  it('from multiple doors (E,N)', () => {
    const doors = [
      { x: width - 1, z: halfZ },      // east
      { x: halfX, z: 0 },              // north
    ];
    const tiles = getCorridorTiles(doors, width, depth);
    printTileMap(tiles, width, depth, 'X');
    expect(tiles.has(`${halfX},${halfZ}`)).toBe(true);
  });

  it('from multiple doors (W,S)', () => {
    const doors = [
      { x: 0, z: halfZ },              // west
      { x: halfX, z: depth - 1 }       // south
    ];
    const tiles = getCorridorTiles(doors, width, depth);
    printTileMap(tiles, width, depth, 'X');
    expect(tiles.has(`${halfX},${halfZ}`)).toBe(true);
  });
});
