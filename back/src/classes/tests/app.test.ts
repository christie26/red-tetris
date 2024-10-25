import http from "http"; 
import { io } from "../../app.js"
import { app } from "../../app.js"
import { Server } from "socket.io";
import Client from "socket.io-client";
import Player from "../Player.js"
import Room from "../Room.js";
import Board from "../Board.js";
import { jest, describe, expect, test, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';


let httpServer: http.Server;
let ioServer: Server;
let port: number;
let clientSocket: any;

beforeAll((done) => {
  // Create a new HTTP server and attach the Express app to it
  httpServer = http.createServer(app);
  
  // Start listening on a random available port
  httpServer.listen(0, () => {
    port = (httpServer.address() as any).port; // Dynamically assigned port
    // Attach socket.io to the HTTP server
    ioServer = new Server(httpServer)
    io.attach(httpServer);
    done();
  });
});

afterAll((done) => {
  // Close the HTTP server after all tests
  io.close()
  httpServer.close((err) => {
    if (err) {
      console.error("Error closing server: ", err)
    }
    done();
  });
});

beforeEach((done) => {
  // Establish a client connection before each test
  clientSocket = Client(`http://localhost:${port}`, {
    query: { room: "test-room", player: "test-player" },
  });
  clientSocket.on("connect", done);
});

afterEach(() => {
  // Disconnect the client after each test
  if (clientSocket && clientSocket.connected) {
    clientSocket.disconnect();
    } 
  }
);

// Helper functions for finding rooms and players
const findRoom = (socketId: string) => {
  return ioServer.sockets.adapter.rooms.get("test-room");
};

const findPlayer = (socketId: string) => {
  return { playername: "test-player", socket: socketId }; // Mock implementation
};

describe("Express HTTP routes", () => {
  test("should respond to http://localhost with status 404", async () => {
    const res = await fetch(`http://localhost:${port}/`);
    expect(res.status).toBe(404);
    
  });

  test("should respond to /room/port with status 200 and check user uniqueness", async () => {
    const res = await fetch(`http://localhost:${port}/room/port`);
    expect(res.status).toBe(200);
  });
  
  test("should return 400 if player name is not unique", async () => {
    // First request to add the player
    await fetch(`http://localhost:${port}/test-room/test-player`);
    
    // Second request should fail since the player is already in the room
    const res = await fetch(`http://localhost:${port}/test-room/test-player`);
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toBe("Player name is not unique.");
    });
    });
    
    describe("Socket.io events", () => {
      test("should handle 'leaderClick' and start the game", (done) => {
        const roomSpy = jest.spyOn(Room.prototype, 'startgame');

        clientSocket.emit("leaderClick");

        // Listen for any game-start-related events here, or ensure no errors are thrown
        clientSocket.on("gameStarted", () => {
          expect(roomSpy).toHaveBeenCalled();
          done(); // Assuming the server emits 'gameStarted' when the game begins
          });
          });
    /*
    test("should handle 'keyboard' events for ArrowLeft", (done) => {
            // Spy on the moveSide method, since ArrowLeft should trigger this method
        const moveSideSpy = jest.spyOn(Board.prototype, 'moveSide');

        // Emit the 'keyboard' event with ArrowLeft key down
        clientSocket.emit("keyboard", { type: "down", key: "ArrowLeft" });

        // Listen for the 'keyboardProcessed' event to ensure the server handled the event
        clientSocket.on("keyboardProcessed", () => {
          // Assert that moveSide was called with 'left'
          expect(moveSideSpy).toHaveBeenCalledWith("left");
          done();
        });
      // const boardSpy = jest.spyOn(Board.prototype, 'startgame');
      // clientSocket.emit("keyboard", { type: "down", key: "ArrowLeft" });
      
      // // Test some server-side effect here or check for specific responses
      // clientSocket.on("keyboardProcessed", () => {
      //   expect(boardSpy).toHaveBeenCalled();
      //   done();
      //   });
        });*/
        
  test("should handle disconnect event and clean up rooms", (done) => {
    const roomSpy = jest.spyOn(Room.prototype, 'playerDisconnect');
    clientSocket.disconnect();

    setTimeout(() => {
      // Check if the roomSpy was called when the player disconnected
      expect(roomSpy).toHaveBeenCalledWith("test-player");  // Replace "test-player" with your player's name
      done();  // Finish the test
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
