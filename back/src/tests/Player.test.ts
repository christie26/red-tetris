import Player from "../classes/Player.js";
import Room from "../classes/Room.js";
import Board from "../classes/Board.js";
import { io } from "../app.js";
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

jest.mock("../app.js", () => ({
  io: {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  },
}));

describe("Player Class Tests", () => {
  let player: any;
  let room: any;
  let socket = "testSocket";
  let key = "testKey";

  beforeEach(() => {
    room = new Room("TestRoom");
    player = new Player("John", socket, key, true, room);
  });

  // Constructor Tests
  test("Player-Should create player with correct attributes", () => {
    expect(player.playername).toBe("John");
    expect(player.socket).toBe(socket);
    expect(player.isLeader).toBe(true);
    expect(player.Room).toBe(room);
    expect(player.Board).toBeInstanceOf(Board);
    expect(player.isPlaying).toBe(false);
  });

  // Update Key Tests
  test("Player-Should update the board key correctly", () => {
    const newKey = "newTestKey";
    const originalBoard = player.Board;
    player.updateKey(newKey);

    // Check if the Board is a new instance
    expect(player.Board).not.toBe(originalBoard);
    expect(player.Board).toBeInstanceOf(Board);
  });

  // Game Over Tests
  test("Player-Should handle game over correctly", () => {
    player.isPlaying = true;

    // Mocking Board and Room methods
    jest.spyOn(player.Board, "freezeBoard").mockImplementation(() => {});
    jest.spyOn(player.Room, "onePlayerDied").mockImplementation(() => {});

    player.gameover();

    expect(player.isPlaying).toBe(false);
    expect(player.Board.freezeBoard).toHaveBeenCalled();
    expect(player.Room.onePlayerDied).toHaveBeenCalledWith(player);
  });

  // Sending Next Piece Tests
  test("Player-Should send next piece via socket", () => {
    const nextPiece = {
      type: "T",
      shape: [
        [1, 1, 1],
        [0, 1, 0],
      ],
    };
    player.sendNextPiece(nextPiece);

    expect(io.to).toHaveBeenCalledWith(socket);
    expect(io.emit).toHaveBeenCalledWith("nextpiece", { piece: nextPiece });
  });

  // Edge Case for Game Over without playing
  test("Player-Should not crash if gameover is called when not playing", () => {
    player.isPlaying = false;
    expect(() => player.gameover()).not.toThrow();
  });
});
