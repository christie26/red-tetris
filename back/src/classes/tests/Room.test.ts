import exp from "constants";
import Board from "../Board.js";
import Player from "../Player.js"
import Room from "../Room.js";
import { validate as uuidValidate } from "uuid";

jest.mock("../Board")

describe("Room class", () => {
    let mockPlayer: Player
    let room: Room
    beforeEach(() => {
        room = new Room("test-room");
        mockPlayer = new Player("test-player", "socket-id", "test-key", true, room);
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear any mock data after each test
      });
    
      it("should initialize room properties correctly", () => {
        expect(room.roomname).toBe("test-room")
        expect(room.players).toBe([])
        expect(room.waiters).toBe([])
        expect(room.isPlaying).toBe(false)
        expect(uuidValidate(room.key)).toBe(true)
        expect(room.winner).toBe(null)
        expect(room.score).toBeInstanceOf(Map)
        expect(room.speedLevel).toBe(1)
      })
})