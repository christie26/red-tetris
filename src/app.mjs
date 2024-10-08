import express from 'express';
import http from 'http';
import Server from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import Player from './server/classes/Player.mjs';
import Room from './server/classes/Room.mjs'
let pressedKeys = {}; // Track pressed keys
const c = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RESET: '\x1b[0m'
};

const app = express();
const server = http.createServer(app);
const io = new Server(server);
let rooms = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/favicon.ico', (req, res) => {
  res.send()
})

app.get('/socket.io/socket.io.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '/node_modules/socket.io-client/dist/socket.io.js'));
});

app.use(express.static(path.join(__dirname, 'client')));

app.get('/*', (req, res) => {
  let result = parseURL(req.path)
  switch (result) {
    case 1:
      res.sendFile(path.join(__dirname, 'alert.html'));
      break;
    case 2:
      res.sendFile(path.join(__dirname, 'alert_user.html'));
      break;
    case 3:
      res.status(404).sendFile(path.join(__dirname, 'error.html'));
      break;
    default:
      res.sendFile(path.join(__dirname, 'client', 'index.html'));
      break;
  }
});

io.on('connection', function (socket) {
  const queryParams = socket.handshake.query;
  if (queryParams.room == "undefined" || queryParams.playername == "undefined") {
    socket.emit('redirect', '/error');
    socket.disconnect();
    return;
  }
  addUserToRoom(queryParams.room, queryParams.playername, socket)

  socket.on('disconnect', () => {
    const room = rooms.find(room => room.roomname === queryParams.room)
    room.playerDisconnect(queryParams.playername)
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
    let player = room.players.find(player => player.playername === queryParams.playername)
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

server.listen(3000, function () {
  console.log('red-tetris server listening on port 3000');
});

function splitPath(path) {
  const trimmedPath = path.replace(/^\/|\/$/g, '');

  return trimmedPath ? trimmedPath.split('/') : [];
}

function parseURL(Url) {
  if (Url == "/error")
    return (3)
  const tab = splitPath(Url)
  if (!tab || tab.length != 2)
    return (1)
  else if (!checkUserUnique(tab[1], tab[0])) {
    return (2)
  } else {
    return (0)
  }
}

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

  return;
}

export default io;
