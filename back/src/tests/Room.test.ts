import exp from "constants";
import Board from "../classes/Board.js";
import Player from "../classes/Player.js";
import Room from "../classes/Room.js";
import { validate as uuidValidate } from "uuid";
import http from "http";
import { io, app, findPlayer, findRoom } from "../app.js";
import { Server } from "socket.io";
import { Socket } from "socket.io-client";
import Client from "socket.io-client";
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

// NOTE - we will not implement integrated test for now (not required bu subject)
// describe("Room Class Integrated Test", () => {
//   let room: Room;

//   beforeAll((done) => {
//     httpServer = http.createServer(app);
//     httpServer.listen(0, () => {
//       port = (httpServer.address() as any).port;
//       ioServer = new Server(httpServer);
//       io.attach(httpServer);
//       done();
//     });
//   });
//   beforeEach(() => {
//     clientSocket = Client(`http://localhost:${port}`, {
//       query: { room: "test-room", player: "test-player" },
//     });
//   });
//   afterAll((done)=> {
//     io.close();
//     httpServer.close((err) => {
//       if (err) {
//         console.error("Error closing server: ", err);
//       }
//       done();
//     });
//   })
//   afterEach(() => {
//     if (clientSocket && clientSocket.connected) {
//       clientSocket.disconnect();
//     }
//   });

//   test("one user connect", (done) => {
//     clientSocket.on("connect", () => {
//       room = findRoom(clientSocket.id);
//       expect(room.roomname).toBe("test-room");
//       done();
//     });
//   });
// });

jest.mock("../app.js", () => ({
  io: {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  },
}));

describe("Room Class Unit Test - constructor & addPlayer", () => {
  let room: Room;

  beforeAll(() => {});
  beforeEach(() => {
    jest.useFakeTimers();
    room = new Room("test-room");
  });
  afterAll(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  test("Room-constructor", (done) => {
    expect(room.roomname).toBe("test-room");
    expect(room.players).toEqual([]);
    expect(room.waiters).toEqual([]);
    expect(room.isPlaying).toBe(false);
    expect(room.key).toBeDefined();
    expect(room.winner).toBe(null);
    expect(room.score).toEqual(new Map());
    expect(room.speedLevel).toBe(1);
    done();
  });
  test("Room-addPlayer-leader", (done) => {
    room.addPlayer("player1", "socket1");

    expect(room.players).toHaveLength(1);
    expect(room.players[0].playername).toBe("player1");
    expect(room.players[0].socket).toBe("socket1");
    expect(room.players[0].isLeader).toBe(true);
    expect(room.players[0].Room).toBe(room);
    expect(io.to).toHaveBeenCalledWith("socket1");
    expect(io.emit).toHaveBeenCalledWith(
      "join",
      expect.objectContaining({
        type: "leader",
      }),
    );
    done();
  });
  test("Room-addPlayer-player", (done) => {
    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");

    expect(room.players).toHaveLength(2);
    expect(room.players[1].playername).toBe("player2");
    expect(room.players[1].socket).toBe("socket2");
    expect(room.players[1].isLeader).toBe(false);
    expect(io.to).toHaveBeenCalledWith("socket2");
    expect(io.emit).toHaveBeenCalledWith(
      "join",
      expect.objectContaining({
        type: "player",
      }),
    );
    done();
  });
  test("Room-addPlayer-waiter", (done) => {
    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    room.leaderStartGame(1);
    room.addPlayer("player3", "socket3");

    expect(room.players).toHaveLength(2);
    expect(room.waiters).toHaveLength(1);
    expect(room.waiters[0].playername).toBe("player3");
    expect(room.waiters[0].socket).toBe("socket3");
    expect(room.waiters[0].isLeader).toBe(false);
    expect(io.to).toHaveBeenCalledWith("socket3");
    expect(io.emit).toHaveBeenCalledWith(
      "join",
      expect.objectContaining({
        type: "waiter",
      }),
    );
    expect(room.isPlaying).toBe(true);
    expect(room.players[0].isPlaying).toBe(true);
    expect(room.players[1].isPlaying).toBe(true);
    expect(room.waiters[0].isPlaying).toBe(false);
    done();
  });
});

describe("Room Class Unit Test - playerDisconnect", () => {
  let room: Room;

  beforeAll((done) => {
    jest.useFakeTimers();
    done();
  });
  afterAll((done) => {
    jest.clearAllTimers();
    done();
  });
  beforeEach((done) => {
    room = new Room("test-room");
    done();
  });
  afterEach(() => {});

  test("Room-playerDisconnect-non-exist-player", () => {
    const consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    room.addPlayer("player1", "socket1");
    room.playerDisconnect("non-exist-player");

    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Attempt to disconnect, non-exist-player is not in the room.",
    );

    expect(room.players).toHaveLength(1);
    expect(room.players[0].playername).toBe("player1");
    consoleErrorMock.mockRestore();
  });
  test("Room-playerDisconnect-player-ready", (done) => {
    const freezeIfPlayingSpy = jest.spyOn(room, "freezeIfPlaying");
    const checkEndgameSpy = jest.spyOn(room, "checkEndgame");
    room.addPlayer("player1", "socket1");

    expect(room.players).toHaveLength(1);

    room.playerDisconnect("player1");
    expect(room.players).toHaveLength(0);
    expect(freezeIfPlayingSpy).not.toHaveBeenCalled();
    expect(checkEndgameSpy).not.toHaveBeenCalled();
    // NOTE - check socket event 'leave' is missing
    done();
  });
  test("Room-playerDisconnect-player-three-playing", (done) => {
    const freezeIfPlayingSpy = jest.spyOn(room, "freezeIfPlaying");
    const checkEndgameSpy = jest.spyOn(room, "checkEndgame");
    const endgameSpy = jest.spyOn(room, "endgame");

    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    room.addPlayer("player3", "socket3");
    expect(room.players).toHaveLength(3);
    room.leaderStartGame(1);
    expect(room.players[1].isPlaying).toBe(true);

    room.playerDisconnect("player2");

    expect(room.players).toHaveLength(2);
    expect(io.emit).toHaveBeenCalledWith(
      "leave",
      expect.objectContaining({
        player: "player2",
      }),
    );
    expect(freezeIfPlayingSpy).toHaveBeenCalled();
    expect(checkEndgameSpy).toHaveBeenCalled();
    expect(endgameSpy).not.toHaveBeenCalled();
    expect(room.players[0].isPlaying).toBe(true);
    expect(room.isPlaying).toBe(true);
    done();
  });
  test("Room-playerDisconnect-player-two-playing", () => {
    const freezeIfPlayingSpy = jest.spyOn(room, "freezeIfPlaying");
    const checkEndgameSpy = jest.spyOn(room, "checkEndgame");
    const endgameSpy = jest.spyOn(room, "endgame");

    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    room.leaderStartGame(1);
    expect(room.players[1].isPlaying).toBe(true);

    room.playerDisconnect("player2");

    expect(room.players).toHaveLength(1);

    expect(freezeIfPlayingSpy).toHaveBeenCalled();
    expect(checkEndgameSpy).toHaveBeenCalled();
    expect(endgameSpy).toHaveBeenCalled();
    expect(room.players[0].isPlaying).toBe(false);
    expect(room.isPlaying).toBe(false);
  });
  test("Room-playerDisconnect-waiter", () => {
    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    room.leaderStartGame(1);
    room.addPlayer("player3", "socket3");

    expect(room.waiters).toHaveLength(1);
    room.playerDisconnect("player3");

    expect(room.waiters).toHaveLength(0);
  });
  test("Room-playerDisconnect-setNewLeader-from players", () => {
    const setNewLeaderSpy = jest.spyOn(room, "setNewLeader");

    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");

    expect(room.players[0].isLeader).toBe(true);

    room.playerDisconnect("player1");

    expect(setNewLeaderSpy).toHaveBeenCalled();
    expect(room.players[0].playername).toBe("player2");
    expect(room.players[0].isLeader).toBe(true);
  });
  test("Room-playerDisconnect-setNewLeader-from waiters", () => {
    const setNewLeaderSpy = jest.spyOn(room, "setNewLeader");

    room.addPlayer("player1", "socket1");
    room.leaderStartGame(1);
    room.addPlayer("player2", "socket2");

    expect(room.waiters[0].playername).toBe("player2");

    room.playerDisconnect("player1");
    // TODO - check it again! check if it doesn't crash the server
    expect(setNewLeaderSpy).toHaveBeenCalled();
    expect(room.waiters[0].playername).toBe("player2");
    expect(room.waiters[0].isLeader).toBe(true);
  });
});

describe("Room Class Unit Test - leaderStartGame", () => {
  let room: Room;

  beforeAll((done) => {
    jest.useFakeTimers();
    done();
  });
  afterAll((done) => {
    jest.clearAllTimers();
    done();
  });
  beforeEach((done) => {
    room = new Room("test-room");
    done();
  });
  afterEach(() => {});

  test("Room-leaderStartGame-1", () => {
    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    room.leaderStartGame(1);

    expect(room.isPlaying).toBe(true);
    expect(io.to).toHaveBeenCalledWith("socket1");
    expect(io.to).toHaveBeenCalledWith("socket2");
    expect(io.emit).toHaveBeenCalledWith("startgame", expect.any(Object));
  });
  test("Room-leaderStartGame-2", () => {
    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    room.leaderStartGame(2);

    expect(room.isPlaying).toBe(true);
    expect(room.speedLevel).toBe(2);
  });
});

describe("Room Class Unit Test - onePlayerDied", () => {
  let room: Room;

  beforeAll((done) => {
    jest.useFakeTimers();
    done();
  });
  afterAll((done) => {
    jest.clearAllTimers();
    done();
  });
  beforeEach((done) => {
    room = new Room("test-room");
    done();
  });
  afterEach(() => {});

  test("Room-onePlayerDied", () => {
    const updateBoardSpy = jest.spyOn(room, "updateBoard");

    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    room.leaderStartGame(1);
    room.onePlayerDied(room.players[0]);

    expect(room.isPlaying).toBe(true);
    expect(updateBoardSpy).toHaveBeenCalledWith(
      room.players[0].playername,
      expect.anything(),
      "died",
    );
    expect(io.emit).toHaveBeenCalledWith(
      "gameover",
      expect.objectContaining({
        dier: "player1",
      }),
    );
  });
  test("Room-onePlayerDied-endgame", () => {
    const onePlayerDiedSpy = jest.spyOn(room, "onePlayerDied");
    const checkEndgameSpy = jest.spyOn(room, "checkEndgame");
    const endgameSpy = jest.spyOn(room, "endgame");

    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");

    room.leaderStartGame(1);
    expect(room.isPlaying).toBe(true);

    room.players[0].isPlaying = false;
    room.onePlayerDied(room.players[0]);

    expect(onePlayerDiedSpy).toHaveBeenCalled();
    expect(checkEndgameSpy).toHaveBeenCalled();
    expect(endgameSpy).toHaveBeenCalledWith("player2");

    expect(room.isPlaying).toBe(false);
  });
  test("Room-onePlayerDied-soloplay", () => {
    const endgameSpy = jest.spyOn(room, "endgame");
    room.addPlayer("player1", "socket1");
    room.leaderStartGame(1);
    room.onePlayerDied(room.players[0]);

    expect(endgameSpy).toHaveBeenCalledWith(null);
  });
});

describe("Room Class Unit Test - endgame", () => {
  let room: Room;

  beforeAll((done) => {
    jest.useFakeTimers();
    done();
  });
  afterAll((done) => {
    jest.clearAllTimers();
    done();
  });
  beforeEach((done) => {
    room = new Room("test-room");
    done();
  });

  test("Room-checkEndgame", () => {
    const endgameSpy = jest.spyOn(room, "endgame");

    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    room.players[0].isPlaying = true;
    room.players[1].isPlaying = false;

    room.checkEndgame();

    expect(endgameSpy).toHaveBeenCalledWith("player1");
  });
  test("Room-endgame", () => {
    const endgameSpy = jest.spyOn(room, "endgame");
    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    room.leaderStartGame(1);

    expect(room.isPlaying).toBe(true);

    room.onePlayerDied(room.players[1]);
    room.endgame("player1");

    expect(room.isPlaying).toBe(false);
    expect(io.emit).toHaveBeenCalledWith(
      "endgame",
      expect.objectContaining({
        winner: "player1",
      }),
    );
  });
  test("Room-endgame-updateWinnerScore", () => {
    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    room.leaderStartGame(1);

    room.endgame("player2");

    expect(room.score.get("player2")).toBe(1);
  });
  test("Room-endgame-addWaitersToScore", () => {
    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    room.leaderStartGame(1);
    room.addPlayer("player3", "socket3");

    room.endgame("player2");

    expect(room.score.get("player3")).toBe(0);
  });
});

describe("Room Class Unit Test - updateBoard & sendPenalty", () => {
  let room: Room;
  jest.mock("../app.js", () => ({
    io: {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    },
  }));

  beforeAll((done) => {
    jest.useFakeTimers();
    done();
  });
  afterAll((done) => {
    jest.clearAllTimers();
    done();
  });
  beforeEach((done) => {
    room = new Room("test-room");
    done();
  });

  test("Room-updateBoard", () => {
    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    const mockBoard = [
      [0, 0],
      [1, 1],
    ];
    room.updateBoard("player1", mockBoard, "testType");
    // BUG/TODO - have to understand socket on/emit better
    // expect(io.emit).toHaveBeenCalledWith("updateboard", {
    //   roomname: room.roomname,
    //   player: "player1",
    //   board: mockBoard,
    //   type: "testType",
    // });
  });
  test("Room-sendPenalty", () => {
    room.addPlayer("player1", "socket1");
    room.addPlayer("player2", "socket2");
    room.leaderStartGame(1);
    jest
      .spyOn(room.players[1].Board, "recievePenalty")
      .mockImplementation(() => {});

    room.sendPenalty("player1", 4);

    expect(room.players[1].Board.recievePenalty).toHaveBeenCalledWith(4);
  });
});
