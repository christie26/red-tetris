import express, { query } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import Room from './server/classes/Room.mjs'
import cors from 'cors';

let pressedKeys = {};
let rooms = [];
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
  }});

server.listen(8000, function () {
  console.log('red-tetris server listening on port 8000');
});
app.use(cors({
  origin: 'http://localhost:3000', // Allow your client URL
  methods: ['GET', 'POST'], // Allow specific HTTP methods
  credentials: true // Allow credentials (optional, depending on your needs)
}));
app.get('/favicon.ico', (req, res) => {
  res.send()
})
app.get('/socket.io/socket.io.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)), '/node_modules/socket.io-client/dist/socket.io.js'));
});
app.get('/:room/:player', (req, res) => {
  if (checkUserUnique(req.params.player, req.params.room)) {
    res.status(200).send('Good');
  } else {
    res.status(400).send('Player name is not unique.');
  }
});
app.get('/error', (res) =>{
  res.status(403).send('Forbidden: Access denied');
})

io.on('connection', function (socket) {
  const queryParams = socket.handshake.query;
  console.log('user connect', queryParams, socket.id)
  if (queryParams.room == "undefined" || queryParams.player == "undefined") {
    socket.emit('redirect', '/error');
    socket.disconnect();
    return;
  }
  addUserToRoom(queryParams.room, queryParams.player, socket.id)

  socket.on('disconnect', () => {
    const room = rooms.find(room => room.roomname === queryParams.room)
    room.playerDisconnect(queryParams.player)
    if (room.players.length == 0 && room.waiters.length == 0) {
      console.log(`${c.GREEN}%s${c.RESET} is destroyed`, room.roomname)
      rooms = rooms.filter(p => p !== room);
    }
  });
  socket.on('leaderClick', (data) => {
    const room = rooms.find(room => room.roomname === data.roomname)
    if (!room) {
      console.error(`${data.roomname} doesn't exist.`)
    }
    if (room.isPlaying == false)
      room.startGame(data.playername)
  })
  socket.on('keyboard', data => {
    let room = rooms.find(room => room.roomname === queryParams.room)
    let player = room.players.find(player => player.playername === queryParams.player)
    if (!player.isPlaying)
      return;
    if (data.type == 'keydown') {
      if (!pressedKeys[data.key]) {
        pressedKeys[data.key] = true
      } else {
        return
      }
      switch (data.key) {
        case 'left':
          player.Board.fallingPiece.moveSide('left');
          break;
        case 'right':
          player.Board.fallingPiece.moveSide('right');
          break;
        case 'down':
          player.Board.fallingPiece.fasterSpeed();
          break;
        case 'rotate':
          player.Board.fallingPiece.rotatePiece();
          break;
        case 'sprint':
          player.Board.fallingPiece.fallSprint();
          break;
      }
    }
    if (data.type == 'keyup') {
      pressedKeys[data.key] = false;
      if (data.key === 'down') {
        player.Board.fallingPiece.resetSpeed();
      }
    }
  });
});

function checkUserUnique(playername, roomname) {
  const myroom = rooms.find(room => room.roomname === roomname);
  if (myroom) {
    const userExists = myroom.players.some(player => player.playername === playername)
    if (userExists) {
      console.log(`${c.YELLOW}%s${c.RESET} ${c.RED}already existed${c.RESET} in ${c.GREEN}%s${c.RESET}.`, playername, roomname)
      return false;
    } else {
      console.log(`${c.YELLOW}%s${c.RESET} is unique in ${c.GREEN}%s${c.RESET}.`, playername, roomname)
      return true;
    }
  }
  else {
    return true
  }

}
function addUserToRoom(roomname, playername, socket) {
  let room = rooms.find(room => room.roomname == roomname)
  if (!room) {
    room = new Room(roomname)
    rooms.push(room)
  }
  room.addPlayer(playername, socket)
}

export default io;
