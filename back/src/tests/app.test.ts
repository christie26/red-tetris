import http from "http"; 
import { io, findPlayer, findRoom } from "../app.js"
import { app } from "../app.js"
import { Server } from "socket.io";
import Client from "socket.io-client";
import Player from "../classes/Player.js"
import Room from "../classes/Room.js";
import Board from "../classes/Board.js";
import { jest, describe, expect, test, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';


let httpServer: http.Server;
let ioServer: Server;
let port: number;
let clientSocket: any;

beforeAll((done) => {
  httpServer = http.createServer(app);
  
  httpServer.listen(0, () => {
    port = (httpServer.address() as any).port; 
    ioServer = new Server(httpServer)
    io.attach(httpServer);
    done();
  });
});

afterAll((done) => {
  io.close()
  httpServer.close((err) => {
    if (err) {
      console.error("Error closing server: ", err)
    }
    done();
  });
});

beforeEach((done) => {
  const currentTest = expect.getState().currentTestName;
  
  if (currentTest === "testing connection") {
    done();
    return;
  }

  clientSocket = Client(`http://localhost:${port}`, {
    query: { room: "test-room", player: "test-player" },
  });
  clientSocket.on("connect", done);
});

afterEach(() => {
  if (clientSocket && clientSocket.connected) {
    clientSocket.disconnect();
    } 
  }
);


describe("Express HTTP routes", () => {

  test("should respond to http://localhost with status 404", async () => {
        const res = await fetch(`http://localhost:${port}/`);
        expect(res.status).toBe(404);
        
      });

  test("testing connection",  async () => {
    // isQueryParams.mockReturnValue(false);

    const clientSocket = Client(`http://localhost:${port}`, {
      query: { invalid: "param" }, // Pass invalid query params
    });

    clientSocket.on("redirect", (url) => {
      expect(url).toBe("/error"); // Confirm redirect event and URL
    });

    clientSocket.on("disconnect", () => {
      // Confirm client is disconnected
      expect(clientSocket.connected).toBe(false);
      clientSocket.close();
    });
  });

  test("should respond to /room/port with status 200 and check user uniqueness", async () => {
    const res = await fetch(`http://localhost:${port}/room/port`);
    expect(res.status).toBe(200);
  });

  test("should return 400 if player name is not unique", async () => {
    await fetch(`http://localhost:${port}/test-room/test-player`);
    
    const res = await fetch(`http://localhost:${port}/test-room/test-player`);
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toBe("Player name is not unique.");
    });
  });
    
describe("Socket.io events", () => {
  test("check socket.on leaderClick", (done) => {
    const roomSpy = jest.spyOn(Room.prototype, 'leaderStartGame');

    clientSocket.on("gameStarted", () => {
      const room = findRoom(clientSocket.id);
      expect(room.leaderStartGame).toHaveBeenCalled();
      done();
      });
    clientSocket.emit("leaderClick", {speed : 1});
  });
    
    test("should handle 'keyboard' events for ArrowLeft", (done) => {

          const player = findPlayer(clientSocket.id);
          player.isPlaying = true
          const moveSideSpy = jest.spyOn(Board.prototype, 'moveSide');

        clientSocket.on("keyboardProcessedLeft", () => {
          expect(moveSideSpy).toHaveBeenCalledWith("left");
          done();
        });

        clientSocket.emit("keyboard", { type: "down", key: "ArrowLeft" });
        
      });

      test("should handle 'keyboard' events for ArrowRight", (done) => {

        const player = findPlayer(clientSocket.id);
        player.isPlaying = true
        const moveSideSpy = jest.spyOn(Board.prototype, 'moveSide');

      clientSocket.on("keyboardProcessedRight", () => {
        expect(moveSideSpy).toHaveBeenCalledWith("right");
        done();
      });

      clientSocket.emit("keyboard", { type: "down", key: "ArrowRight" });
      
    });

  test("should handle disconnect event and clean up rooms", (done) => {
    const roomSpy = jest.spyOn(Room.prototype, 'playerDisconnect');
    clientSocket.disconnect();

    setTimeout(() => {
      expect(roomSpy).toHaveBeenCalledWith("test-player");  
      done(); 
    }, 100);  
  });
});

describe("Room and Player management", () => {
  test("should find a room by socketId", () => {
    const room = findRoom(clientSocket.id);
    expect(room).not.toBeNull();
  });

  test("should find a player by socketId", () => {
    const player = findPlayer(clientSocket.id);
    expect(player).not.toBeNull();
  });
});
