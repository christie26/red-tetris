import Piece from "../classes/Piece.js";
import Pieces from "../Pieces.js";
import Tile from "../classes/Tile.js";
import {
  jest,
  describe,
  expect,
  test,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  it,
} from "@jest/globals";

describe("Piece class", () => {
  it("should initialize with the correct type and tiles for iBlock", () => {
    const type = 0; // iBlock
    const left = 3;
    const direction = 0;

    const piece = new Piece(type, left, direction);

    expect(piece.type).toBe(type + 1);
    expect(piece.tiles).toHaveLength(4);

    const expectedPositions = Pieces[type][direction].map((index) => ({
      x: (index % 10) + left,
      y: Math.floor(index / 10),
      type: type + 1,
    }));

    expectedPositions.forEach((expectedPos, i) => {
      const tile = piece.tiles[i];
      expect(tile).toBeInstanceOf(Tile);
      expect(tile.x).toBe(expectedPos.x);
      expect(tile.y).toBe(expectedPos.y);
      expect(tile.type).toBe(expectedPos.type);
    });
  });

  it("should initialize with the correct type and tiles for tBlock", () => {
    const type = 1; // tBlock
    const left = 2;
    const direction = 1;

    const piece = new Piece(type, left, direction);

    expect(piece.type).toBe(type + 1);
    expect(piece.tiles).toHaveLength(4);

    const expectedPositions = Pieces[type][direction].map((index) => ({
      x: (index % 10) + left,
      y: Math.floor(index / 10),
      type: type + 1,
    }));

    expectedPositions.forEach((expectedPos, i) => {
      const tile = piece.tiles[i];
      expect(tile.x).toBe(expectedPos.x);
      expect(tile.y).toBe(expectedPos.y);
      expect(tile.type).toBe(expectedPos.type);
    });
  });

  it("should initialize with the correct type and tiles for oBlock", () => {
    const type = 6; // oBlock
    const left = 1;
    const direction = 2;

    const piece = new Piece(type, left, direction);

    expect(piece.type).toBe(type + 1);
    expect(piece.tiles).toHaveLength(4);

    const expectedPositions = Pieces[type][direction].map((index) => ({
      x: (index % 10) + left,
      y: Math.floor(index / 10),
      type: type + 1,
    }));

    expectedPositions.forEach((expectedPos, i) => {
      const tile = piece.tiles[i];
      expect(tile.x).toBe(expectedPos.x);
      expect(tile.y).toBe(expectedPos.y);
      expect(tile.type).toBe(expectedPos.type);
    });
  });

  it("should initialize with the correct type and tiles for jBlock", () => {
    const type = 3; // jBlock
    const left = 5;
    const direction = 3;

    const piece = new Piece(type, left, direction);

    expect(piece.type).toBe(type + 1);
    expect(piece.tiles).toHaveLength(4);

    const expectedPositions = Pieces[type][direction].map((index) => ({
      x: (index % 10) + left,
      y: Math.floor(index / 10),
      type: type + 1,
    }));

    expectedPositions.forEach((expectedPos, i) => {
      const tile = piece.tiles[i];
      expect(tile.x).toBe(expectedPos.x);
      expect(tile.y).toBe(expectedPos.y);
      expect(tile.type).toBe(expectedPos.type);
    });
  });

  it("should initialize with the correct type and tiles for sBlock", () => {
    const type = 4; // sBlock
    const left = 4;
    const direction = 2;

    const piece = new Piece(type, left, direction);

    expect(piece.type).toBe(type + 1);
    expect(piece.tiles).toHaveLength(4);

    const expectedPositions = Pieces[type][direction].map((index) => ({
      x: (index % 10) + left,
      y: Math.floor(index / 10),
      type: type + 1,
    }));

    expectedPositions.forEach((expectedPos, i) => {
      const tile = piece.tiles[i];
      expect(tile.x).toBe(expectedPos.x);
      expect(tile.y).toBe(expectedPos.y);
      expect(tile.type).toBe(expectedPos.type);
    });
  });

  it("should initialize with the correct type and tiles for lBlock", () => {
    const type = 2; // lBlock
    const left = 3;
    const direction = 1;

    const piece = new Piece(type, left, direction);

    expect(piece.type).toBe(type + 1);
    expect(piece.tiles).toHaveLength(4);

    const expectedPositions = Pieces[type][direction].map((index) => ({
      x: (index % 10) + left,
      y: Math.floor(index / 10),
      type: type + 1,
    }));

    expectedPositions.forEach((expectedPos, i) => {
      const tile = piece.tiles[i];
      expect(tile.x).toBe(expectedPos.x);
      expect(tile.y).toBe(expectedPos.y);
      expect(tile.type).toBe(expectedPos.type);
    });
  });

  it("should throw error for invalid type or direction", () => {
    const type = -1; // Invalid type
    const left = 3;
    const direction = 0;

    expect(() => new Piece(type, left, direction)).toThrow(Error);

    const invalidDirection = 5; // Invalid direction
    expect(() => new Piece(0, left, invalidDirection)).toThrow(Error);
  });
});
