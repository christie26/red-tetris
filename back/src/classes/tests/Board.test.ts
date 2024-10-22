import Board from "../Board";
import Piece from "../Piece";
import Player from "../Player"
import Room from "../Room";

// Mock dependencies
jest.mock("../Player",() => {
    return jest.fn().mockImplementation((type, left, direction) => ({
      type,
      tiles: [
        { x: 3, y: 0, type: 1 },
        { x: 4, y: 0, type: 1 },
        { x: 3, y: 1, type: 1 },
        { x: 4, y: 1, type: 1 },
      ], // Provide mock tiles array
    }));});
jest.mock("../Room");
jest.mock("../Piece");
jest.mock("../Tile");

describe("Board", () => {
  let mockSocket: string;
  let mockPlayer: jest.Mocked<Player>;
  let mockRoom: jest.Mocked<Room>;
  let board: Board;

  beforeEach(() => {
    // Mock Room and its properties/methods
    mockRoom = {
      roomname: "test-room",
      players: [],
      waiters: [],
      isPlaying: false,
      key: "test-room-key",
      winner: null,
      speedLevel: 1,
      updateBoard: jest.fn(),  // Mock the updateBoard method
      sendPenalty: jest.fn(),  // Mock the sendPenalty method
    } as unknown as jest.Mocked<Room>;

    // Mock Player and its properties/methods
    mockPlayer = {
      playername: "TestPlayer",
      socket: "mock-socket",
      isLeader: false,
      Board: undefined!,  // This will be assigned later by the Board constructor
      isPlaying: false,
      Room: mockRoom,
      gameover: jest.fn(),  // Mock the gameover method
    } as unknown as jest.Mocked<Player>;

    // Initialize the Board with the mocked Player and Room
    mockSocket = "mock-socket";
    board = new Board(mockSocket, "test-key", mockPlayer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should initialize with default values", () => {
    expect(board.width).toBe(10);
    expect(board.height).toBe(20);
    expect(board.fixedTiles.length).toBe(20);
    expect(board.fixedTiles[0].length).toBe(10);
  });

  test("should start the game and create a new piece", () => {
    jest.spyOn(board, "newPiece").mockImplementation();
    board.startgame();
    expect(board.newPiece).toHaveBeenCalled();
  });

  test("should handle piece movement to the down", () => {
    const pieceType = 1; // Example piece type
    const piece = new Piece(pieceType, 3, 0); // Create a real piece
  
    // Assert that tiles are initialized
    expect(piece.tiles).toBeDefined();
    expect(piece.tiles.length).toBeGreaterThan(0);
  
    board.fallingPiece = piece; // Set the piece on the board
  
    board.moveTiles(piece.tiles, "down"); // Move the piece down
    expect(piece.tiles[0].y).toBe(1); // The y position should increase by 1
    
  });
  test("should not move piece down if blocked by fixed tile", () => {
    const pieceType = 1; // Example piece type
    const piece = new Piece(pieceType, 3, 0); // Create a piece
    board.fallingPiece = piece;
  
    // Simulate a fixed tile directly below the piece
    board.fixedTiles[1][3] = 1;
  
    // Attempt to move the piece down
    const initialY = piece.tiles[0].y;
    board.moveTiles(piece.tiles, "down");
  
    // The piece should not move down because of the fixed tile
    expect(piece.tiles[0].y).toBe(initialY);
  });
  

});
