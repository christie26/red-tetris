import express from 'express';
import http from 'http';
import Server from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import Player from './server/classes/Player.mjs';
import Room from './server/classes/Room.mjs'

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
  let res = parseURL(req.path)
  switch (res) {
    case 1 :
      res.sendFile(path.join(__dirname, 'alert_user.html'));
      console.log("user already exist, sending alert_user.html");
    case 2:
      res.sendFile(path.join(__dirname, 'alert.html'));
      console.log("Invalid URL, sending alert.html");
    default:
      res.sendFile(path.join(__dirname, 'client', 'index.html'));

  }
  
});

io.on('connection', function (socket) {
  const queryParams = socket.handshake.query;
  if (queryParams.room == undefined || queryParams.playername == undefined) {
    socket.emit('redirect', '/error');
    socket.disconnect();
    return;
  }
// TODO-Balkis : don't start immediately
// TODO-Balkis : make a start button to leader
// TODO-Balkis : when game ends ( = only one player survive), it goes back to waiting page
// TODO-Yoonseo : see other player's board
// TODO-Yoonseo : implement penalty

  addUserToRoom(queryParams.room, queryParams.playername, socket)

  let player = new Player('player', socket, "temp", true);
  player.Board.newPiece();

  socket.on('keyboard', data => {
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
  });

  socket.on('disconnect', () => {
    console.log(`${queryParams.playername} is disconnected and left from ${queryParams.room}`)
    console.log('User disconnected');
  });
});

server.listen(3000, function () {
  console.log('Socket IO server listening on port 3000');
});

function splitPath(path) {
  const trimmedPath = path.replace(/^\/|\/$/g, '');

  return trimmedPath ? trimmedPath.split('/') : [];
}

function parseURL(Url) {
  const tab = splitPath(Url)
  if (!tab || tab.length != 2 )
    return (1)
  else if (!checkUserUnique(tab[1])){
    return (2)
  } else {
    return (0)
  }
}

function checkUserUnique(playername){
  const userExists = rooms.some(room =>
    room.players.some(player => player.playername=== playername))

  if (userExists) {
      return false;
  } else {
      return true;
  }
}

function addUserToRoom(roomname, playername, socket) {
  let room = rooms.find(room => room.roomname == roomname)
  if (!room) {
    room = new Room(roomname)
    console.log(`${room.roomname} is created`)
    rooms.push(room)
  }
  room.addPlayer(playername, socket)
  console.log(`${playername} is join to ${room.roomname}`)
}
