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
  if (parseURL(req.path) === false) {
    console.log("Invalid URL, sending alert.html");
    res.sendFile(path.join(__dirname, 'alert.html'));
  } else {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
  }
});

io.on('connection', function (socket) {

  const queryParams = socket.handshake.query;
  // console.log('Query parameters:', queryParams.room);
  // console.log('Query parameters:', queryParams.username);
  // here to create room and add the player
  if (queryParams.room == undefined || queryParams.username == undefined) {
    socket.emit('redirect', '/error');  // Send a redirect message
    socket.disconnect();  // Optionally disconnect the client
    return;
  }

  addUserToRoom(queryParams.room, queryParams.username, socket)

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

  socket.on('pause', (data) => {
    if (data.data === 'pause') {
      player.Board.pauseGame();
    } else {
      player.Board.restartGame();
    }
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, function () {
  console.log('Socket IO server listening on port 3000');
});

function splitPath(path) {
  // Remove leading and trailing slashes if they exist
  const trimmedPath = path.replace(/^\/|\/$/g, '');

  // Split the string by '/' and return the array
  return trimmedPath ? trimmedPath.split('/') : [];
}


function parseURL(Url)
{
  const tab = splitPath(Url)
  if (tab.length == 0)
    return true;
  if (tab.length != 2 || !checkUserUnique(tab[1]))
    return (false)
}

// Parsing Url

function checkUserUnique(username){
  const userExists = rooms.some(room =>
    room.players.some(player => player.playerName === username))

  if (userExists) {
      return false;
  } else {
      return true;
  }
}

function addUserToRoom(roomname, playername, socket){
  if (rooms) {
    const room = rooms.find(room => room.name == roomname)
    if (room) {
      room.addPlayer(playername, socket)
      // add user to rooms
    } else {
      // create room and user as leader
      const newRoom = new Room(roomname)
      // TODOEY : socket to add
      newRoom.addPlayer(playername, socket)
      rooms.push(newRoom)

    }
  } else {
    // rooms is empty
    const newRoom = new Room(roomname)
    newRoom.addPlayer(playername, socket)
    rooms.push(newRoom)
  }
}
