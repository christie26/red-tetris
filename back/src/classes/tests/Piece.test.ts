import Piece from "../Piece";
import Pieces from "../../Pieces";
import Tile from "../Tile";

describe('Piece class', () => {

    it('should initialize with the correct type and tiles for iBlock', () => {
      const type = 0; // iBlock
      const left = 3;
      const direction = 0;
  
      // Create a new piece (iBlock, direction 0)
      const piece = new Piece(type, left, direction);
  
      // Check if the type is set correctly
      expect(piece.type).toBe(type);
  
      // Check if the tiles array is populated with 4 tiles
      expect(piece.tiles).toHaveLength(4);
  
      // Manually calculate the expected tile positions based on Pieces data
      const expectedPositions = Pieces[type][direction].map(index => ({
        x: (index % 10) + left,
        y: Math.floor(index / 10),
        type: type + 1
      }));
  
      // Check each tile
      expectedPositions.forEach((expectedPos, i) => {
        const tile = piece.tiles[i];
        expect(tile).toBeInstanceOf(Tile);
        expect(tile.x).toBe(expectedPos.x);
        expect(tile.y).toBe(expectedPos.y);
        expect(tile.type).toBe(expectedPos.type);
      });
    });
  
    it('should initialize with the correct type and tiles for tBlock', () => {
      const type = 1; // tBlock
      const left = 2;
      const direction = 1;
  
      // Create a new piece (tBlock, direction 1)
      const piece = new Piece(type, left, direction);
  
      // Check if the type is set correctly
      expect(piece.type).toBe(type);
  
      // Check if the tiles array is populated with 4 tiles
      expect(piece.tiles).toHaveLength(4);
  
      // Manually calculate the expected tile positions based on Pieces data
      const expectedPositions = Pieces[type][direction].map(index => ({
        x: (index % 10) + left,
        y: Math.floor(index / 10),
        type: type + 1
      }));
  
      // Check each tile
      expectedPositions.forEach((expectedPos, i) => {
        const tile = piece.tiles[i];
        expect(tile).toBeInstanceOf(Tile);
        expect(tile.x).toBe(expectedPos.x);
        expect(tile.y).toBe(expectedPos.y);
        expect(tile.type).toBe(expectedPos.type);
      });
    });
  
    it('should initialize with the correct type and tiles for oBlock', () => {
      const type = 6; // oBlock
      const left = 1;
      const direction = 2;
  
      // Create a new piece (oBlock, direction 2)
      const piece = new Piece(type, left, direction);
  
      // Check if the type is set correctly
      expect(piece.type).toBe(type);
  
      // Check if the tiles array is populated with 4 tiles
      expect(piece.tiles).toHaveLength(4);
  
      // Manually calculate the expected tile positions based on Pieces data
      const expectedPositions = Pieces[type][direction].map(index => ({
        x: (index % 10) + left,
        y: Math.floor(index / 10),
        type: type + 1
      }));
  
      // Check each tile
      expectedPositions.forEach((expectedPos, i) => {
        const tile = piece.tiles[i];
        expect(tile).toBeInstanceOf(Tile);
        expect(tile.x).toBe(expectedPos.x);
        expect(tile.y).toBe(expectedPos.y);
        expect(tile.type).toBe(expectedPos.type);
      });
    });
  
    it('should handle various directions and pieces correctly', () => {
      const type = 3; // jBlock
      const left = 5;
      const direction = 3;
  
      // Create a new piece (jBlock, direction 3)
      const piece = new Piece(type, left, direction);
  
      // Check if the type is set correctly
      expect(piece.type).toBe(type);
  
      // Check if the tiles array is populated with 4 tiles
      expect(piece.tiles).toHaveLength(4);
  
      // Manually calculate the expected tile positions based on Pieces data
      const expectedPositions = Pieces[type][direction].map(index => ({
        x: (index % 10) + left,
        y: Math.floor(index / 10),
        type: type + 1
      }));
  
      // Check each tile
      expectedPositions.forEach((expectedPos, i) => {
        const tile = piece.tiles[i];
        expect(tile).toBeInstanceOf(Tile);
        expect(tile.x).toBe(expectedPos.x);
        expect(tile.y).toBe(expectedPos.y);
        expect(tile.type).toBe(expectedPos.type);
      });
    });
  });