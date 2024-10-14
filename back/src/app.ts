import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Room from './classes/Room.js';
import cors from 'cors';

function isQueryParams(query: any): query is QueryParams {
    return typeof query.room === 'string' && typeof query.player === 'string';
  }

interface PressedKeys {
  [key: string]: boolean;
}

interface QueryParams {
  room: string;
  player: string;
}

let pressedKeys: PressedKeys = {};
let rooms: Room[] = [];

const c = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RESET: '\x1b[0m'
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Specify your client URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true // Optional
  }
});

server.listen(8000, function () {
  console.log('red-tetris server listening on port 8000');
});

app.use(cors({
  origin: 'http://localhost:3000', // Allow your client URL
  methods: ['GET', 'POST'], // Allow specific HTTP methods
  credentials: true // Allow credentials (optional, depending on your needs)
}));

app.get('/favicon.ico', (req: Request, res: Response) => {
  res.send();
});

app.get('/:room/:player', (req: Request, res: Response) => {
  if (checkUserUnique(req.params.player, req.params.room)) {
    res.status(200).send('Good');
  } else {
    res.status(400).send('Player name is not unique.');
  }
});

app.get('/error', (req: Request, res: Response) => {
  res.status(403).send('Forbidden: Access denied');
});

io.on('connection', (socket) => {
  const queryParams = socket.handshake.query;
  
  if (!isQueryParams(queryParams)) {
    socket.emit('redirect', '/error');
    socket.disconnect();
    return;
  }
  addUserToRoom(queryParams.room, queryParams.player, socket.id);

  socket.on('disconnect', () => {
    const room = rooms.find(room => room.roomname === queryParams.room);
    if (room) {
      room.playerDisconnect(queryParams.player);
      if (room.players.length === 0 && room.waiters.length === 0) {
        console.log(`${c.GREEN}%s${c.RESET} is destroyed`, room.roomname);
        rooms = rooms.filter(p => p !== room);
      }
    }
  });

  socket.on('leaderClick', (data: { roomname: string; playername: string }) => {
    const room = rooms.find(room => room.roomname === data.roomname);
    if (!room) {
      console.error(`${data.roomname} doesn't exist.`);
      return;
    }
    if (!room.isPlaying) {
      room.startGame(data.playername);
    }
  });

  socket.on('keyboard', (data: { type: string; key: string }) => {
    const room = rooms.find(room => room.roomname === queryParams.room);
    const player = room?.players.find(player => player.playername === queryParams.player);
    if (!player?.isPlaying) return;

    if (data.type === 'keydown') {
      if (!pressedKeys[data.key]) {
        pressedKeys[data.key] = true;
      } else {
        return;
      }

      switch (data.key) {
        case 'left':
            if(player.Board.fallingPiece)
                player.Board.fallingPiece.moveSide('left');
            break;
        case 'right':
            if(player.Board.fallingPiece)
                player.Board.fallingPiece.moveSide('right');
          break;
        case 'down':
            if(player.Board.fallingPiece)
                player.Board.fallingPiece.fasterSpeed();
          break;
        case 'rotate':
            if(player.Board.fallingPiece)
                player.Board.fallingPiece.rotatePiece();
          break;
        case 'sprint':
            if(player.Board.fallingPiece)
                player.Board.fallingPiece.fallSprint();
          break;
      }
    }

    if (data.type === 'keyup') {
      pressedKeys[data.key] = false;
      if (data.key === 'down') {
        if(player.Board.fallingPiece)
            player.Board.fallingPiece.resetSpeed();
      }
    }
  });
});

function checkUserUnique(playername: string, roomname: string): boolean {
  const myroom = rooms.find(room => room.roomname === roomname);
  if (myroom) {
    const userExists = myroom.players.some(player => player.playername === playername);
    if (userExists) {
      console.log(`${c.YELLOW}%s${c.RESET} ${c.RED}already existed${c.RESET} in ${c.GREEN}%s${c.RESET}.`, playername, roomname);
      return false;
    } else {
      console.log(`${c.YELLOW}%s${c.RESET} is unique in ${c.GREEN}%s${c.RESET}.`, playername, roomname);
      return true;
    }
  } else {
    console.log(`${c.GREEN}%s${c.RESET} is empty.`, roomname)
    return true;
  }
}

function addUserToRoom(roomname: string, playername: string, socketId: string): void {
  let room = rooms.find(room => room.roomname === roomname);
  if (!room) {
    room = new Room(roomname);
    rooms.push(room);
  }
  room.addPlayer(playername, socketId);
}

export default io;
