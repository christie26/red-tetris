import exp from "constants";
import Board from "../classes/Board.js";
import Player from "../classes/Player.js"
import Room from "../classes/Room.js";
import { validate as uuidValidate } from "uuid";
import { io } from '../app.js';
import { jest, describe, expect, test, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';

jest.mock('../classes/../classes/app.js', () => ({
  io: {
  to: jest.fn().mockReturnThis(), // Make sure it returns itself for chaining
  emit: jest.fn(), // Mock the emit function
  },
}));

jest.useRealTimers(); // Restore real timers after tests


describe('Room Class Tests', () => {
  let room: Room;
  let player1: Player;
  let player2: Player;
  let player3: Player;


  beforeEach(() => {
    jest.useFakeTimers(); // Enable fake timers
    room = new Room("TestRoom");
    player1 = new Player("Player1", "socket1", room.key, true, room);
    player2 = new Player("Player2", "socket2", room.key, false, room);
    player3 = new Player("Player1", "socket1", room.key, true, room);
    player1.Board = new Board(room.key, player1);
    player2.Board = new Board(room.key, player2);
    player3.Board = new Board(room.key, player3);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
    jest.clearAllTimers(); // Clear any timers
  });

  // Test for constructor
  test('should create room with correct attributes', () => {
    expect(room.roomname).toBe("TestRoom");
    expect(room.players).toEqual([]);
    expect(room.waiters).toEqual([]);
    expect(room.isPlaying).toBe(false);
    expect(room.key).toBeDefined();
    expect(room.winner).toBe(null);
    expect(room.score).toEqual(new Map());
    expect(room.speedLevel).toBe(1);
  });

  // Test adding players
  test('should add player as leader if first to join', () => {
    room.addPlayer(player1.playername, player1.socket);

    expect(room.players).toHaveLength(1);
    expect(room.players[0].playername).toBe(player1.playername);
    expect(io.to).toHaveBeenCalledWith(player1.socket);
    expect(io.emit).toHaveBeenCalledWith('join', expect.objectContaining({
    type: 'leader',
    }));
  });

  test('should add player as regular player if not the first', () => {
    room.addPlayer(player1.playername, player1.socket);
    room.addPlayer(player2.playername, player2.socket);

    expect(room.players).toHaveLength(2);
    expect(room.players[1].playername).toBe(player2.playername);
    expect(io.to).toHaveBeenCalledWith(player2.socket);
    expect(io.emit).toHaveBeenCalledWith('join', expect.objectContaining({
      type: 'player',
    }));
  });

  test('should add player as waiter if game is already in progress', () => {
    room.addPlayer(player1.playername, player1.socket);
    room.addPlayer(player2.playername, player2.socket);
    room.leaderStartGame(1);
    room.addPlayer(player3.playername, player3.socket);

    expect(room.waiters).toHaveLength(1);
    expect(room.waiters[0].playername).toBe(player3.playername);
    expect(io.to).toHaveBeenCalledWith(player3.socket);
    expect(io.emit).toHaveBeenCalledWith('join', expect.objectContaining({
      type: 'waiter',
    }));
  });
  // Test player disconnection
  test('should handle player disconnection correctly', () => {
    room.addPlayer(player1.playername, player1.socket);
    room.addPlayer(player2.playername, player2.socket);
    room.playerDisconnect(player2.playername);

    expect(room.players).toHaveLength(1);
    expect(io.to).toHaveBeenCalledWith(player2.socket);
    expect(io.emit).toHaveBeenCalledWith('leave', expect.any(Object));
  });

  test('should handle disconnecting waiter correctly', () => {
    room.addPlayer(player1.playername, player1.socket);
    room.leaderStartGame(1);
    room.addPlayer(player2.playername, player2.socket);
    room.playerDisconnect(player2.playername); // Make player1 a waiter

    expect(room.waiters).toHaveLength(0); // Player1 should be removed
  });

  test('should set new leader if leader disconnects', () => {
    room.addPlayer(player1.playername, player1.socket);
    room.addPlayer(player2.playername, player2.socket);
    room.playerDisconnect(player1.playername); // Disconnect leader

    expect(room.players[0].isLeader).toBe(true); // Player2 should become the new leader
  });

  // Test starting a game
  test('should start the game correctly', () => {
    room.addPlayer(player1.playername, player1.socket);
    room.addPlayer(player2.playername, player2.socket);
    room.leaderStartGame(1);

    expect(room.isPlaying).toBe(true);
    expect(io.to).toHaveBeenCalledWith(player1.socket);
    expect(io.to).toHaveBeenCalledWith(player2.socket);
    expect(io.emit).toHaveBeenCalledWith('startgame', expect.any(Object));
  });

  // Test one player dying
  test('should handle one player dying correctly', () => {
    room.addPlayer(player1.playername, player1.socket);
    room.addPlayer(player2.playername, player2.socket);
    room.leaderStartGame(1);
    
    jest.spyOn(room, 'updateBoard');
    player1.isPlaying = true; // Simulate player1 dying
    room.onePlayerDied(player1);
    
    expect(room.updateBoard).toHaveBeenCalledWith(player1, expect.anything(), 'died');
    expect(io.emit).toHaveBeenCalledWith('gameover', expect.any(Object));
  });
    
  test('should end game if one player remains', () => {
    room.addPlayer(player1.playername, player1.socket);
    room.leaderStartGame(1);

    room.onePlayerDied(player1); // Simulate player1 dying
    expect(room.isPlaying).toBe(false);
    expect(io.emit).toHaveBeenCalledWith('endgame', expect.any(Object));
  });

  // Test for sending penalties
  test('should send penalties correctly', () => {
    room.addPlayer(player1.playername, player1.socket);
    room.addPlayer(player2.playername, player2.socket);
    room.leaderStartGame(1);

    console.log("room players", room.players.length)
    // Mock the receivePenalty method in the Player class
    jest.spyOn(player2.Board, 'recievePenalty').mockImplementation(() => {});

    room.sendPenalty(player1.playername, 4);

    expect(player2.Board.recievePenalty).toHaveBeenCalled();
  });
    
  // Test for updating board
  test('should update the board correctly', () => {
    jest.spyOn(io, 'emit'); // Mock io.emit
    room.addPlayer(player1.playername, player1.socket);
    
    const mockBoard = [[0, 0], [1, 1]]; // Sample board state
    room.updateBoard(player1, mockBoard, 'testType');
    
    expect(io.emit).toHaveBeenCalledWith('updateboard', {
      roomname: room.roomname,
      player: player1.playername,
      board: mockBoard,
      type: 'testType',
      });
  });
      
  // Test for handling endgame
  test('should end game with winner correctly', () => {
    room.addPlayer(player1.playername, player1.socket);
    room.addPlayer(player2.playername, player2.socket);
    room.leaderStartGame(1);
    
    player2.isPlaying = false; // Simulate player2 dying
    room.onePlayerDied(player2);
    
    room.endgame(player1.playername); // End game with player1 as winner
    
    expect(room.isPlaying).toBe(false);
    expect(io.emit).toHaveBeenCalledWith('endgame', expect.objectContaining({
      winner: player1.playername,
      }));
  });

  test('should reset scores and key after game ends', () => {
    room.addPlayer(player1.playername, player1.socket);
    room.addPlayer(player2.playername, player2.socket);
    room.leaderStartGame(1);

    room.onePlayerDied(player1);
    room.endgame(player2.playername);

    expect(room.score.get(player2.playername)).toBe(1); // Check player1's score increment
    expect(room.key).toBeDefined(); // Ensure a new key is generated
  });

});
