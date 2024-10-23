import Board from "../Board.js";
import Player from "../Player.js"
import Room from "../Room.js";

describe('Board Class', () => {
  let room: Room;
  let player: Player;
  let board: Board;

  beforeEach(() => {
    room = new Room('test-room');
    player = new Player('testPlayer', 'testSocket', 'testKey', true, room);
    board = player.Board;
  });

  test('should create a new board with correct dimensions', () => {
    expect(board.width).toBe(10);
    expect(board.height).toBe(20);
    expect(board.fixedTiles.length).toBe(20);
    expect(board.fixedTiles[0].length).toBe(10);
    });
    /*
    test('should spawn a new piece', () => {
      board.startgame();
      expect(board.fallingPiece).not.toBeNull();
      expect(board.fallingPiece.tiles.length).toBeGreaterThan(0);
      });
      
  test('should move a piece downwards', () => {
    board.newPiece();
    const initialPosition = board.fallingPiece.tiles.map(tile => tile.y);
    board.moveTiles(board.fallingPiece.tiles, 'down');
    const newPosition = board.fallingPiece.tiles.map(tile => tile.y);
    
    expect(newPosition.every((y, i) => y === initialPosition[i] + 1)).toBeTruthy();
  });

  test('should not move a piece out of bounds (left)', () => {
    board.newPiece();
    const initialTiles = board.dupTiles(board.fallingPiece.tiles);
    board.moveTiles(board.fallingPiece.tiles, 'left');
    
    if (!board.isFree(board.fallingPiece.tiles)) {
      board.fallingPiece.tiles = initialTiles;
    }
    
    const newTiles = board.fallingPiece.tiles.map(tile => tile.x);
    expect(newTiles).toEqual(initialTiles.map(tile => tile.x));
  });

  test('should rotate a piece', () => {
    board.newPiece();
    const initialTiles = board.dupTiles(board.fallingPiece.tiles);
    board.rotatePiece();

    expect(board.fallingPiece.tiles).not.toEqual(initialTiles);
  });

  test('should freeze the board when piece cannot move down', () => {
    board.newPiece();
    
    // Simulate placing the piece at the bottom
    while (board.canGoDown()) {
      board.moveTiles(board.fallingPiece.tiles, 'down');
    }
    
    board.routine();  // Run the game routine, which should freeze the piece
    const frozenTiles = board.fixedTiles.flat().filter(tile => tile > 0);

    expect(frozenTiles.length).toBeGreaterThan(0);
    expect(board.fallingPiece).toBeNull();
  });

  test('should clear full lines and apply penalty', () => {
    board.fixedTiles[18] = Array(10).fill(1);  // Simulate almost full row
    board.fixedTiles[19] = Array(10).fill(1);  // Simulate full row

    board.newPiece();
    board.fallingPiece.tiles = [
      new Tile(4, 17, 1), new Tile(5, 17, 1), new Tile(4, 18, 1), new Tile(5, 18, 1)
    ]; // Simulate small block that fills the final tile
    
    board.fixPieceToBoard();
    board.clearLinesAndSendPenalty();
    
    const clearedRow = board.fixedTiles[19].every(tile => tile === 0);
    expect(clearedRow).toBeTruthy();
    expect(board.unpaidPenalties).toBe(0);
  });

  test('should handle penalties correctly', () => {
    board.recievePenalty(2);  // Apply penalty of 2 lines
    board.applyPenalty();

    expect(board.penaltyLine).toBe(2);
    expect(board.fixedTiles.slice(18, 20).every(row => row.every(tile => tile === 20))).toBe(true);
  });

  test('should trigger gameover if new piece touches other pieces', () => {
    board.fixedTiles[0][4] = 1;  // Simulate a tile near the top
    board.newPiece();
    
    // If gameover is called, isPlaying should be false
    expect(player.isPlaying).toBe(false);
  });

  test('should change speed level correctly', () => {
    board.changeSpeedLevel(3);
    expect(board.speedLevel).toBe(3);
  });

  test('should apply sprint speed mode', () => {
    board.changeSpeedMode('sprint');
    expect(board.intervalId).not.toBeNull();
  });
  */
});