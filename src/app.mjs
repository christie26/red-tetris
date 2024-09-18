import express from 'express';
import http from 'http';
import Server from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import Player from './server/classes/Player.mjs';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
let rooms = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



app.get('/socket.io/socket.io.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '/node_modules/socket.io-client/dist/socket.io.js'));
});

//app.use('/', express.static(path.join(__dirname, 'client')));
app.use(express.static(path.join(__dirname, 'client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// API endpoint to check if username exists
app.get('/checkUser/:username', (req, res) => {
  const username = req.params.username;
  const userExists = rooms.some(room => 
    room.players.some(player => player.playerName === myPlayerName))
  
  if (userExists) {
      return res.json({ exists: true });
  } else {
      return res.json({ exists: false });
  }
});

io.on('connection', function (socket) {
  let player = new Player('player', socket, "temp", true);
  player.Board.newPiece();

  socket.on('keyboard', data => {
    switch (data.direction) {
      case 'left':
        player.Board.fallingPiece.moveLeft();
        break;
      case 'right':
        player.Board.fallingPiece.moveRight();
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
