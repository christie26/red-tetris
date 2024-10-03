import express from 'express';
import http from 'http';
import Server from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import Player from './server/classes/Player.mjs';
import Room from './server/classes/Room.mjs'

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
    case 1 :
      console.log("Invalid URL, sending alert.html");
      res.sendFile(path.join(__dirname, 'alert.html'));
      break;
    case 2:
      console.log("user already exist, sending alert_user.html");
      res.sendFile(path.join(__dirname, 'alert_user.html'));
      break;
    case 3:
      console.log("Error path")
      res.status(404).sendFile(path.join(__dirname, 'error.html'));
      break;
    default:
      console.log("ici dans default ")
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
// Balkis review : so when people come i let them here but they don't see game's players
//                  and I need a function to clear board at the endGame when the Game is finished
//                  I manage endGame only when people leave and not the game is end idk when its end in the game logic
// TODO-Yoonseo : see other player's board
// TODO-Yoonseo : implement penalty
  addUserToRoom(queryParams.room, queryParams.playername, socket)

  socket.on('disconnect', () => {
    console.log('User disconnected');
    const room = rooms.find(room => room.roomname === queryParams.room)
    const newLeader = room.removePlayer(queryParams.playername)
    if (newLeader)
      io.to(newLeader.socket.id).emit("newLeader")
    if (room.players.length == 0 && room.waitingPlayers.length == 0) {
      console.log(`Destroy ${room.roomname}`)
      rooms = rooms.filter(p => p !== room);
    }
  });
  socket.on('startGame', (data) => {
    console.log(`${c.YELLOW}%s${c.RESET} began a game.`, data.playername)

    const room = rooms.find(room => room.roomname === data.roomname)
    const playerList = room.players.map(player => player.playername);

    if (room.isPlaying == false) {
      room.players.forEach(player => {
        io.to(player.socket.id).emit("players", {data: playerList})
      });
      room.startGame()
    }
  })
  socket.on('keyboard', data => {
    let room = rooms.find(room => room.roomname === queryParams.room)
    let player = room.players.find(player => player.playername === queryParams.playername)
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
});


server.listen(3000, function () {
  console.log('Socket IO server listening on port 3000');
});

function splitPath(path) {
  const trimmedPath = path.replace(/^\/|\/$/g, '');

  return trimmedPath ? trimmedPath.split('/') : [];
}

function parseURL(Url) {
  if (Url == "/error")
    return (3)
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
  //TODO-BALKIS: we should check in the room. not any room.
  const userExists = rooms.some(room =>
    room.players.some(player => player.playername=== playername))

  if (userExists) {
    console.log(`${playername} already exist :(`)
      return false;
  } else {
    console.log(`${playername} is unique. :)`)
      return true;
  }
}

function addUserToRoom(roomname, playername, socket) {
  let room = rooms.find(room => room.roomname == roomname)
  if (!room) {
    room = new Room(roomname)
    rooms.push(room)
  }
  const isLeader = room.addPlayer(playername, socket)

  if (isLeader == true)
    socket.emit("isLeader")
  else {
    if (room.isPlaying == false)
      socket.emit("joinRoom")
    else
      socket.emit("waitRoom")
  }
  return;
}
