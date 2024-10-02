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
  // console.log(`room: ${queryParams.room}, player: ${queryParams.player}`)
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
  let leader = addUserToRoom(queryParams.room, queryParams.playername, socket)

  if (leader == true)
    socket.emit("isLeader")
  else {
    const room = rooms.find(room => room.roomName == queryParams.room)
    if (room.isPlaying == false)
      socket.emit("joinRoom")
    else
      socket.emit("waitRoom")
  }

  socket.on('disconnect', () => {
    console.log(`${queryParams.playername} is disconnected and left from ${queryParams.room}`)
    let room = rooms.find(room => room.roomName === queryParams.room)
    console.log("room is ", room.roomName)
    console.log("player to disconnect ", queryParams.playername)
    let newLeader = room.removePlayer(queryParams.playername)
    console.log("new Leader or not in disconnect is ", newLeader)
    if (newLeader != "false"){
      // The player who was removed was the Leader show the button to the new Leader
      let player = room.players.find(player => player.playername === newLeader)
      console.log("player to be new leader is ", player.playername)
      io.to(player.socket.id).emit("newLeader")
    }
    console.log('User disconnected');
  });
  socket.on('startGame', () => {
    console.log("begin the game")
    let room = rooms.find(room => room.roomName === queryParams.room)
    if (room.isPlaying == false) {
      room.startGame()
    }

  })
  socket.on('keyboard', data => {
    let room = rooms.find(room => room.roomName === queryParams.room)
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
  const userExists = rooms.some(room =>
    room.players.some(player => player.playername=== playername))

  if (userExists) {
    console.log("user already exist")
      return false;
  } else {
    console.log("user not exist")
      return true;
  }
}

function addUserToRoom(roomname, playername, socket) {
  let leader = false
  let room = rooms.find(room => room.roomName == roomname)
  if (!room) {
    room = new Room(roomname)
    console.log(`${roomname} is created`)
    rooms.push(room)
  }
  leader = room.addPlayer(playername, socket)
  console.log(`${playername} is join to ${roomname}`)
  return (leader)
}
