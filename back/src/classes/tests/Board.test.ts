import Board from "../Board.js";
import Player from "../Player.js"
import Room from "../Room.js";
import Piece from '../Piece';
import Tile from '../Tile';
import seedrandom from 'seedrandom';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

jest.mock('../Piece');
jest.mock('../Player');
jest.mock('../Room');

jest.useFakeTimers(); 

describe('Board', () => {
  let board: Board;
  let mockPlayer: Player;
  let mockRoom: Room;
  let server;
  const mockKey = 'testKey';
  
  // Helper function to generate a mock piece with tiles
  const generateMockPiece = (type: number, x: number, y: number): Piece => {
    const mockPiece = {  // Mock piece structure
      tiles: [
        new Tile(x, y, type),
        new Tile(x + 1, y, type),
        new Tile(x, y + 1, type),
        new Tile(x + 1, y + 1, type),
      ],
      type,
      x,
      y,
    };
    return mockPiece as unknown as Piece;
  };

  beforeAll((done) => {
    // Start the Express server
    const app = express();
    server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    server.listen(8000, () => {
      console.log('red-tetris server listening on port 8000');
      done();
    });
  });

  afterAll((done) => {
    // Close the Express server
    server.close(() => {
      console.log('Server closed');
      done();
    });
    if (board.intervalId) {
      clearInterval(board.intervalId);
    }
  });

  (Piece as jest.Mock).mockImplementation(() => generateMockPiece(0, 0, 0));
  beforeEach(() => {
    // Mock the Room class
    mockRoom = new Room('testRoom');
    
    // Create a mock Player
    mockPlayer = new Player('testPlayer', 'testSocket', mockKey, false, mockRoom);
    mockPlayer.Room = mockRoom;

    // Initialize the Board
    board = new Board(mockKey, mockPlayer);
  });


  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    if (board.intervalId) clearInterval(board.intervalId);
  });

  test('initializes with default properties', () => {
    expect(board.width).toBe(10);
    expect(board.height).toBe(20);
    expect(board.fixedTiles.length).toBe(20);
    expect(board.fixedTiles[0].length).toBe(10);
    expect(board.penaltyLine).toBe(0);
    expect(board.unpaidPenalties).toBe(0);
    expect(board.currentPiece).toBeDefined(); // currentPiece should be defined upon initialization
  });

  test('starts the game with valid current piece', () => {
    // Use the helper function to create a valid mock piece with tiles
    const mockPiece = generateMockPiece(0, 0, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.startgame();

    expect(board.currentPiece).toStrictEqual(mockPiece); // Check that currentPiece is properly initialized
    expect(board.currentPiece.tiles).toBeDefined(); // Ensure tiles are defined
    expect(board.currentPiece.tiles.length).toBeGreaterThan(0); // Ensure the tiles array is not empty

    expect(mockPlayer.sendNextPiece).toHaveBeenCalledWith(board.nextPiece);
  });

  test('handles game over if current piece collides', () => {
    const mockPiece = generateMockPiece(0, 0, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    mockPlayer.gameover = jest.fn(); 
    board.fixedTiles[0][0] = 1; // Simulate collision

    board.startgame();
    
    expect(mockPlayer.gameover).toHaveBeenCalled();
  });

  test('moves piece down if possible', () => {
    const mockPiece = generateMockPiece(0, 3, 0);
  (Piece as jest.Mock).mockImplementation(() => mockPiece);
  
  board.startgame();
  board.routine(); // simulate one tick of the game

  // Check if the piece's Y position has moved down
  expect(board.currentPiece.tiles[0].y).toBe(1); // Assuming the piece starts at y=0
  expect(board.currentPiece.tiles[0].x).toBe(3); // X should remain the same
  });

  test('does not move piece down if collision occurs', () => {
    const mockPiece = generateMockPiece(0, 3, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.fixedTiles[1][3] = 1; // Simulate collision below
    board.startgame();
    board.routine();
    
    expect(board.fixedTiles[0][3]).toBe(0); // Piece should not have moved down
  });

  test('moves piece left', () => {
    const mockPiece = generateMockPiece(0, 1, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.startgame();
    board.moveSide('left');

    expect(mockPiece.tiles[0].x).toBe(0); // Piece should move left
  });

  test('does not move piece left if collision occurs', () => {
    const mockPiece = generateMockPiece(0, 0, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.fixedTiles[0][0] = 1; // Simulate collision on the left
    board.startgame();
    board.moveSide('left');

    expect(mockPiece.tiles[0].x).toBe(0); // Piece should not move left
  });

  test('rotates piece', () => {
    const mockPiece = generateMockPiece(0, 1, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.startgame();
    board.rotatePiece();

    expect(mockPiece.tiles[0].y).toBe(0); // Example check after rotation, you may want to add more detailed checks
  });

  test('does not rotate piece if type is 7', () => {
    const mockPiece = generateMockPiece(7, 1, 0); // type 7
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.startgame();
    board.rotatePiece();

    expect(mockPiece.tiles[0].y).toBe(0); // Should not rotate, example check
  });

  test('changes speed level', () => {
    board.changeSpeedLevel(2);

    expect(board.speedLevel).toBe(2);
  });

  test('applies penalties and clears lines', () => {
    const mockPiece = generateMockPiece(0, 0, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    // Simulate some filled lines
    board.fixedTiles[2] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    board.unpaidPenalties = 2;

    board.clearLinesAndSendPenalty();
    
    expect(board.fixedTiles[19].every(x => x === 0)).toBe(true); // Check if line is cleared
  });

  test('freezes board', () => {
    board.freezeBoard();
    
    expect(board.intervalId).toBeNull(); // Board should be frozen
    expect(board.currentPiece).toBeNull(); // Current piece should be null
  });
});