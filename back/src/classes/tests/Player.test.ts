import Player from "../Player";
import Room from "../Room";
import Board from "../Board";

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
