import Player from "../classes/Player.js";
import Room from "../classes/Room.js";
import Board from "../classes/Board.js";
import { io } from '../app.js';
import { jest, describe, expect, test, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';


// Mocking socket.io for testing
jest.mock('../classes/../classes/app.js', () => ({
  io: {
    to: jest.fn().mockReturnThis(), // Make sure it returns itself for chaining
    emit: jest.fn(), // Mock the emit function
  },
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
