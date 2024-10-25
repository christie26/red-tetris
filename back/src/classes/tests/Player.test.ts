import Player from "../Player.js";
import Room from "../Room.js";
import Board from "../Board.js";
import { io } from '../../app.js';


// Mocking socket.io for testing
jest.mock('../../app.js', () => ({
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
}));

describe('Player Class Tests', () => {
  let player;
  let room;
  let socket = 'testSocket'; // Example socket identifier
  let key = 'testKey'; // Example key for board

  beforeEach(() => {
    // Set up a fresh instance of Room and Player for each test.
    room = new Room('TestRoom');
    player = new Player('John', socket, key, true, room);
  });

  // Constructor Tests
  test('should create player with correct attributes', () => {
    expect(player.playername).toBe('John');
    expect(player.socket).toBe(socket);
    expect(player.isLeader).toBe(true);
    expect(player.Room).toBe(room);
    expect(player.Board).toBeInstanceOf(Board);
    expect(player.isPlaying).toBe(false);
  });

  // Update Key Tests
  test('should update the board key correctly', () => {
    const newKey = 'newTestKey';
    const originalBoard = player.Board;
    player.updateKey(newKey);
    
    // Check if the Board is a new instance
    expect(player.Board).not.toBe(originalBoard);
    expect(player.Board).toBeInstanceOf(Board);
  });

  // Game Over Tests
  test('should handle game over correctly', () => {
    player.isPlaying = true; // Simulate that the player is currently playing

    // Mocking Board and Room methods
    jest.spyOn(player.Board, 'freezeBoard').mockImplementation(() => {});
    jest.spyOn(player.Room, 'onePlayerDied').mockImplementation(() => {});

    player.gameover();

    expect(player.isPlaying).toBe(false);
    expect(player.Board.freezeBoard).toHaveBeenCalled();
    expect(player.Room.onePlayerDied).toHaveBeenCalledWith(player);
  });

  // Sending Next Piece Tests
  test('should send next piece via socket', () => {
    const nextPiece = { type: 'T', shape: [[1, 1, 1], [0, 1, 0]] }; // Example piece
    player.sendNextPiece(nextPiece);

    expect(io.to).toHaveBeenCalledWith(socket);
    expect(io.emit).toHaveBeenCalledWith('nextpiece', { piece: nextPiece });
  });

  // Edge Case for Game Over without playing
  test('should not crash if gameover is called when not playing', () => {
    player.isPlaying = false; // Ensure the player is not playing
    expect(() => player.gameover()).not.toThrow(); // Should not throw an error
  });
});


/*
jest.mock("../Board"); // Mock the Board class
jest.mock("../Room");  // Mock the Room class

describe("Player class", () => {
  let mockRoom: Room;
  let player: Player;

  beforeEach(() => {
    mockRoom = new Room("test-room");
    player = new Player("test-player", "socket-id", "test-key", true, mockRoom);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear any mock data after each test
  });

  it("should initialize player properties correctly", () => {
    expect(player.playername).toBe("test-player");
    expect(player.socket).toBe("socket-id");
    expect(player.isLeader).toBe(true);
    expect(player.isPlaying).toBe(false);
    expect(player.Board).toBeDefined();
    expect(player.Room).toBe(mockRoom);
  });

  it("should call Board constructor when creating a new player", () => {
    expect(Board).toHaveBeenCalledWith("socket-id", "test-key", player);
  });

  describe("updateKey", () => {
    it("should update the board when calling updateKey", () => {
      player.updateKey("new-key");
      expect(Board).toHaveBeenCalledWith("socket-id", "new-key", player);
    });
  });

  describe("gameover", () => {
    it("should set isPlaying to false and call Room's onePlayerDied", () => {
      player.isPlaying = true; // Set isPlaying to true first
      player.gameover();

      expect(player.isPlaying).toBe(false);
      expect(mockRoom.onePlayerDied).toHaveBeenCalledWith(player);
    });
  });
});
*/