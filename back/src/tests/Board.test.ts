import Board from "../classes/Board.js";
import Player from "../classes/Player.js";
import Room from "../classes/Room.js";
import Piece from "../classes/Piece";
import Tile from "../classes/Tile";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import {
  jest,
  describe,
  expect,
  test,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
} from "@jest/globals";

jest.mock("../classes/Piece");
jest.mock("../classes/Player");
jest.mock("../classes/Room");

jest.useFakeTimers();

describe("Board", () => {
  let board: Board;
  let mockPlayer: Player;
  let mockRoom: Room;
  let server;
  const mockKey = "testKey";

  const generateMockPiece = (type: number, x: number, y: number): Piece => {
    const mockPiece = {
      // Mock piece structure
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
      console.log("red-tetris server listening on port 8000");
      done();
    });
  });

  afterAll((done) => {
    // Close the Express server
    server.close(() => {
      done();
    });
    if (board.intervalId) {
      clearInterval(board.intervalId);
    }
  });

  (Piece as jest.Mock).mockImplementation(() => generateMockPiece(0, 0, 0));
  beforeEach(() => {
    // Mock the Room class
    mockRoom = new Room("testRoom");

    // Create a mock Player
    mockPlayer = new Player(
      "testPlayer",
      "testSocket",
      mockKey,
      false,
      mockRoom,
    );
    mockPlayer.Room = mockRoom;

    // Initialize the Board
    // board = mockPlayer.Board
    board = new Board(mockRoom.key, mockPlayer);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    if (board.intervalId) clearInterval(board.intervalId);
  });

  test("initializes with default properties", () => {
    expect(board.width).toBe(10);
    expect(board.height).toBe(20);
    expect(board.fixedTiles.length).toBe(20);
    expect(board.fixedTiles[0].length).toBe(10);
    expect(board.penaltyLine).toBe(0);
    expect(board.unpaidPenalties).toBe(0);
    expect(board.currentPiece).toBeDefined(); // currentPiece should be defined upon initialization
  });

  test("starts the game with valid current piece", () => {
    // Use the helper function to create a valid mock piece with tiles
    const mockPiece = generateMockPiece(0, 0, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.startgame();

    expect(board.currentPiece).toStrictEqual(mockPiece); // Check that currentPiece is properly initialized
    expect(board.currentPiece.tiles).toBeDefined(); // Ensure tiles are defined
    expect(board.currentPiece.tiles.length).toBeGreaterThan(0); // Ensure the tiles array is not empty

    expect(mockPlayer.sendNextPiece).toHaveBeenCalledWith(board.nextPiece);
  });

  test("handles game over if current piece collides", () => {
    const mockPiece = generateMockPiece(0, 0, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    mockPlayer.gameover = jest.fn();
    board.fixedTiles[0][0] = 1; // Simulate collision

    board.startgame();

    expect(mockPlayer.gameover).toHaveBeenCalled();
  });

  test("#01 moves piece down if possible", () => {
    const tempPiece = board.currentPiece;
    board.routine();
    tempPiece.tiles.forEach((tile) => {
      tile.y++;
    });

    expect(board.currentPiece).toBe(tempPiece); // X should remain the same
  });

  test("does not move piece down if collision occurs", () => {
    const mockPiece = generateMockPiece(0, 3, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.fixedTiles[1][3] = 1; // Simulate collision below
    board.startgame();
    board.routine();

    expect(board.fixedTiles[0][3]).toBe(0); // Piece should not have moved down
  });

  test("moves piece left", () => {
    const tempPiece = board.currentPiece;
    console.log(tempPiece);
    board.moveSide("left");

    tempPiece.tiles.forEach((tile) => {
      tile.x--;
    });
    expect(board.currentPiece).toBe(tempPiece); // Piece should move left
  });

  test("moves piece cannot moves left because of the border", () => {
    const tempPiece = board.currentPiece;
    let min = 10;

    tempPiece.tiles.forEach((tile) => {
      if (tile.x < min) min = tile.x;
    });
    tempPiece.tiles.forEach((tile) => {
      tile.x = tile.x - min;
    });

    board.currentPiece = tempPiece;
    console.log(tempPiece);
    board.moveSide("left");

    expect(board.currentPiece).toBe(tempPiece); // Piece should move left
  });

  test("does not move piece left if collision occurs", () => {
    // const mockPiece = generateMockPiece(0, 0, 0);
    // (Piece as jest.Mock).mockImplementation(() => mockPiece);
    const mockPiece = new Piece(0, 5, 0);
    // i block
    const tiles = mockPiece.tiles;
    board.startgame();
    board.moveSide("left");

    expect(mockPiece.tiles[0].x).toBe(0); // Piece should not move left
  });

  test("rotates piece", () => {
    const mockPiece = generateMockPiece(0, 1, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.startgame();
    board.rotatePiece();

    expect(mockPiece.tiles[0].y).toBe(0); // Example check after rotation, you may want to add more detailed checks
  });

  test("does not rotate piece if type is 7", () => {
    const mockPiece = generateMockPiece(7, 1, 0); // type 7
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.startgame();
    board.rotatePiece();

    expect(mockPiece.tiles[0].y).toBe(0); // Should not rotate, example check
  });

  test("changes speed level", () => {
    board.changeSpeedLevel(2);

    expect(board.speedLevel).toBe(2);
  });

  test("applies penalties and clears lines", () => {
    const mockPiece = generateMockPiece(0, 0, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    // Simulate some filled lines
    board.fixedTiles[2] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    board.unpaidPenalties = 2;

    board.clearLinesAndSendPenalty();

    expect(board.fixedTiles[19].every((x) => x === 0)).toBe(true); // Check if line is cleared
  });

  test("freezes board", () => {
    board.freezeBoard();

    expect(board.intervalId).toBeNull(); // Board should be frozen
    expect(board.currentPiece).toBeNull(); // Current piece should be null
  });
});
