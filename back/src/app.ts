import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import Room from "./classes/Room.js";
import cors from "cors";
import Player from "./classes/Player.js";

function isQueryParams(query: any): query is QueryParams {
  return typeof query.room === "string" && typeof query.player === "string";
}

interface PressedKeys {
  [key: string]: boolean;
}

const playerKeyStates: { [socketId: string]: PressedKeys } = {};

interface QueryParams {
  room: string;
  player: string;
}

let rooms: Room[] = [];

const c = {
  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  RESET: "\x1b[0m",
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
const PORT = process.env.NODE_ENV === 'test' ? 0 : 8000; // Use port 0 in test, 8000 otherwise

if (process.env.NODE_ENV !== 'test') { // use this for the test
  server.listen(PORT, () => {
    console.log(`red-tetris server listening on port ${PORT}`);
  });
}

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.get("/redtetris.ico", (req: Request, res: Response) => {
  res.send();
});

app.get("/:room/:player", (req: Request, res: Response) => {
  if (checkUserUnique(req.params.player, req.params.room)) {
    res.status(200).send("Good");
  } else {
    res.status(400).send("Player name is not unique.");
  }
});

// app.get("/error", (req: Request, res: Response) => {
//   res.status(403).send("Forbidden: Access denied");
// });

io.on("connection", (socket) => {
  const queryParams = socket.handshake.query;
  if (!isQueryParams(queryParams)) {
    socket.emit("redirect", "/error");
    socket.disconnect();
    return;
  }
  addUserToRoom(queryParams.room, queryParams.player, socket.id);

  socket.on("disconnect", () => {
    const room = rooms.find((room) => room.roomname === queryParams.room);
    if (room) {
      room.playerDisconnect(queryParams.player);
      if (room.players.length === 0 && room.waiters.length === 0) {
        console.log(`[${c.GREEN}%s${c.RESET}] destroyed`, room.roomname);
        rooms = rooms.filter((p) => p !== room);
      }
    }
  });

  socket.on("leaderClick", (data: {speed: number}) => {
    const room = findRoom(socket.id);
    const player = findPlayer(socket.id);
    if (room && player && player === room.players[0]) {
      if (!room.isPlaying) {
        socket.emit("gameStarted") // used for the unit test 
        room.leaderStartGame(data.speed);
      }
    // } else {
    //   console.error("Something wrong with leader click.");
    }
  });

  socket.on("keyboard", (data: { type: string; key: string }) => {
    const player = findPlayer(socket.id);
    if (!player || !player.isPlaying) return;

    if (!playerKeyStates[socket.id]) {
      playerKeyStates[socket.id] = {};
    }

    const pressedKeys = playerKeyStates[socket.id];

    if (data.type === "down") {
      if (!pressedKeys[data.key]) {
        pressedKeys[data.key] = true;
      } else {
        return;
      }
      if (!player.isPlaying) return;
      switch (data.key) {
        case "ArrowLeft":
          player.Board.moveSide("left");
          socket.emit("keyboardProcessed") // for the test
          break;
        case "ArrowRight":
          player.Board.moveSide("right");
          break;
        case "ArrowDown":
          player.Board.changeSpeedMode("fast");
          break;
        case "ArrowUp":
          player.Board.rotatePiece();
          break;
        case " ":
          player.Board.changeSpeedMode("sprint");
          break;
      }
    }

    if (data.type === "up") {
      pressedKeys[data.key] = false;
      if (data.key === "ArrowDown") {
        player.Board.changeSpeedMode("normal");
      }
    }
  });
});

function findRoom(socketId: string): Room {
  return rooms.find((room) =>
    room.players.find((player) => player.socket === socketId),
  );
}
function findPlayer(socketId: string): Player {
  for (const room of rooms) {
    const player = room.players.find((player) => player.socket === socketId);
    if (player) return player;
  }
  return null;
}
function checkUserUnique(playername: string, roomname: string): boolean {
  const myroom = rooms.find((room) => room.roomname === roomname);
  if (myroom) {
    const userExists = myroom.players.some(
      (player) => player.playername === playername,
    );
    if (userExists) {
      console.log(
        `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} ${c.RED}already existed.`,
        roomname,
        playername,
      );
      return false;
    } else {
      console.log(
        `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} is unique.`,
        roomname,
        playername,
      );
      return true;
    }
  } else {
    return true;
  }
}

function addUserToRoom(
  roomname: string,
  playername: string,
  socketId: string,
): void {
  let room = rooms.find((room) => room.roomname === roomname);
  if (!room) {
    room = new Room(roomname);
    rooms.push(room);
  }
  room.addPlayer(playername, socketId);
}

export {io, app};
