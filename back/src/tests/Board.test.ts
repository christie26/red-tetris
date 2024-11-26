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
  let server: any;
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

  test("Board-constructor-with-default-properties", () => {
    expect(board.width).toBe(10);
    expect(board.height).toBe(20);
    expect(board.fixedTiles.length).toBe(20);
    expect(board.fixedTiles[0].length).toBe(10);
    expect(board.penaltyLine).toBe(0);
    expect(board.unpaidPenalties).toBe(0);
    expect(board.currentPiece).toBeDefined();
  });

  test("Board-applyPenalty-distance-smaller-than-line", () => {
    const fixPieceIfTouchSpy = jest.spyOn(Board.prototype, "fixPieceIfTouch");
    const fixPieceToBoardSpy = jest.spyOn(Board.prototype, "fixPieceToBoard");

    for (let stop = 0; stop < 10; stop++) {
      board.fixedTiles[stop] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    for (let stop = 10; stop < 19; stop++) {
      board.fixedTiles[stop] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    }

    board.recievePenalty(8);
    board.applyPenalty();

    expect(fixPieceIfTouchSpy).toHaveBeenCalled();
    expect(fixPieceToBoardSpy).toHaveBeenCalled();
  });

  test("Board-start-game-valid-currentPiece", () => {
    const mockPiece = generateMockPiece(0, 0, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.startgame();

    expect(board.currentPiece).toStrictEqual(mockPiece);
    expect(board.currentPiece.tiles).toBeDefined();
    expect(board.currentPiece.tiles.length).toBeGreaterThan(0);

    expect(mockPlayer.sendNextPiece).toHaveBeenCalledWith(board.nextPiece);
  });

  test("Board-gameover-currentPiece-collides", () => {
    const mockPiece = generateMockPiece(0, 0, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    mockPlayer.gameover = jest.fn();
    board.fixedTiles[0][0] = 1;

    board.startgame();

    expect(mockPlayer.gameover).toHaveBeenCalled();
  });

  test("Board-routine-start-moves-piece-down", () => {
    const tempPiece = board.currentPiece;
    board.routine();
    tempPiece.tiles.forEach((tile) => {
      tile.y++;
    });

    expect(board.currentPiece).toBe(tempPiece);
  });

  test("Board-routine-move-piece-not-down-collision-occurs", () => {
    const mockPiece = generateMockPiece(0, 3, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.fixedTiles[1][3] = 1;
    board.startgame();
    board.routine();

    expect(board.fixedTiles[0][3]).toBe(0);
  });

  test("Board-moveSide-left", () => {
    const tempPiece = board.currentPiece;
    board.moveSide("left");

    tempPiece.tiles.forEach((tile) => {
      tile.x--;
    });
    expect(board.currentPiece).toBe(tempPiece);
  });

  test("Board-not-moveSide-left-because-of-border", () => {
    const tempPiece = board.currentPiece;
    let min = 10;

    tempPiece.tiles.forEach((tile) => {
      if (tile.x < min) min = tile.x;
    });
    tempPiece.tiles.forEach((tile) => {
      tile.x = tile.x - min;
    });

    board.currentPiece = tempPiece;
    board.moveSide("left");

    expect(board.currentPiece).toBe(tempPiece);
  });

  test("Board-endGame-newPiece-touchOtherPiece", () => {
    const playerSpy = jest.spyOn(Player.prototype, "gameover");
    for (let stop = 0; stop < 17; stop++) {
      board.fixedTiles[stop] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    }
    for (let stop = 18; stop < 19; stop++) {
      board.fixedTiles[stop] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    board.newPiece();
    expect(playerSpy).toHaveBeenCalled();
  });

  test("Board-not-moveSide-left-collision-occurs", () => {
    const mockPiece = new Piece(0, 5, 0);

    const tiles = mockPiece.tiles;
    board.startgame();
    board.moveSide("left");

    expect(mockPiece.tiles[0].x).toBe(0);
  });

  test("Board-rotatePiece", () => {
    const mockPiece = generateMockPiece(1, 0, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.startgame();
    board.rotatePiece();

    expect(mockPiece.tiles[0].y).toBe(0);
  });

  test("Board-not-rotate-square-block-piece", () => {
    const mockPiece = generateMockPiece(7, 1, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);

    board.startgame();
    board.rotatePiece();

    expect(mockPiece.tiles[0].y).toBe(0);
  });

  test("Board-changes-speed-level", () => {
    const routineSpy = jest.spyOn(board, "routine");
    board.changeSpeedLevel(2);

    expect(board.speedLevel).toBe(2);
    jest.advanceTimersByTime(250);

    expect(routineSpy).toHaveBeenCalled();

    routineSpy.mockRestore();
  });

  test("Board-clear-Lines-And-Send-Penalty", () => {
    const mockPiece = generateMockPiece(0, 0, 0);
    (Piece as jest.Mock).mockImplementation(() => mockPiece);
    const roomSpy = jest.spyOn(Room.prototype, "sendPenalty");

    for (let stop = 0; stop < 4; stop++) {
      board.fixedTiles[stop] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    }
    board.unpaidPenalties = 3;

    board.clearLinesAndSendPenalty();

    expect(board.fixedTiles[19].every((x) => x === 0)).toBe(true);
    expect(roomSpy).toHaveBeenCalled();
  });

  test("Board-Freez-Board", () => {
    board.freezeBoard();

    expect(board.intervalId).toBeNull();
    expect(board.currentPiece).toBeNull();
  });

  test("Board-changes-speed-mode-sprint", () => {
    const setIntervalSpy = jest.spyOn(global, "setInterval");
    const routineSpy = jest.spyOn(board, "routine");

    board.changeSpeedMode("sprint");

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5);
    setIntervalSpy.mockRestore();
    jest.advanceTimersByTime(250);

    expect(routineSpy).toHaveBeenCalled();

    routineSpy.mockRestore();
  });

  test("Board-changes-speed-mode-fast", () => {
    const setIntervalSpy = jest.spyOn(global, "setInterval");

    board.changeSpeedMode("fast");

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 50);
    setIntervalSpy.mockRestore();
  });

  test("Board-changes-speed-mode-normal", () => {
    const setIntervalSpy = jest.spyOn(global, "setInterval");

    board.changeSpeedMode("normal");

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 500);
    setIntervalSpy.mockRestore();
  });

  test("Board-newPiece-renderPiece", () => {
    const boardSpy = jest.spyOn(Board.prototype, "renderPiece");

    board.newPiece();

    expect(boardSpy).toHaveBeenCalled();
  });

  test("Board-rotate Piece-with-no-freeplace", () => {
    const tempPiece = board.currentPiece;

    for (let stop = 0; stop < 18; stop++) {
      board.fixedTiles[stop] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    }

    const res = board.rotatePiece();
    expect(res).toBe(undefined);
  });

  test("Board-recievePenalty", () => {
    const line = 4;
    board.recievePenalty(line);
    expect(board.unpaidPenalties).toBe(4);
  });

  test("Board rotate Tiles", () => {
    const mockPiece = generateMockPiece(0, 1, 0);
    const tempTiles = mockPiece.tiles;

    const center = tempTiles[0];
    for (let index = 1; index < tempTiles.length; index++) {
      const tile = tempTiles[index];
      const tmp_x = tile.x;
      const tmp_y = tile.y;
      tile.x = center.x + center.y - tmp_y;
      tile.y = center.y - center.x + tmp_x;
    }

    board.rotateTiles(mockPiece.tiles);

    expect(mockPiece.tiles).toBe(tempTiles);
  });

  test("Board-fixPieceToBoard", () => {
    const boardPieceTiles = board.currentPiece.tiles;
    const fixedTiles: number[][] = Array.from({ length: 20 }, () =>
      new Array(10).fill(0),
    );

    for (const tile of boardPieceTiles) {
      fixedTiles[tile.y][tile.x] = tile.type + 10;
    }

    board.fixPieceToBoard();
    expect(board.fixedTiles).toEqual(fixedTiles);
  });

  test("Board-applyPenalty-gameover", () => {
    const playerSpy = jest.spyOn(Player.prototype, "gameover");

    for (let stop = 0; stop < 16; stop++) {
      board.fixedTiles[stop] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    }

    board.recievePenalty(4);
    board.applyPenalty();

    expect(playerSpy).toHaveBeenCalled();
  });

  test("Board-applyPenalty-distance-Equal-to-line", () => {
    const fixPieceIfTouchSpy = jest.spyOn(Board.prototype, "fixPieceIfTouch");
    const fixPieceToBoardSpy = jest.spyOn(Board.prototype, "fixPieceToBoard");
    for (let stop = 0; stop < 10; stop++) {
      board.fixedTiles[stop] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    for (let stop = 10; stop < 19; stop++) {
      board.fixedTiles[stop] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    }

    board.recievePenalty(8);
    board.applyPenalty();

    expect(fixPieceIfTouchSpy).toHaveBeenCalled();
    expect(fixPieceToBoardSpy).toHaveBeenCalled();
  });

  test("Board-line-is-not-full", () => {
    for (let stop = 0; stop < 5; stop++) {
      board.fixedTiles[stop] = [1, 1, 1, 1, 1, 1, 1, 0, 0, 1];
    }
    board.penaltyLine = 4;
    const result = board.isLineFull(5);
    expect(result).toBe(false);
  });
});
