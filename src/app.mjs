import express from 'express';
import http from 'http';
import Server from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import Player from './server/Player.mjs';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/socket.io/socket.io.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '/node_modules/socket.io-client/dist/socket.io.js'));
});

app.use('/', express.static(path.join(__dirname, 'client')));

io.on('connection', function (socket) {
  let player = new Player('player', socket);

  socket.on('keyboard', data => {
    switch (data.direction) {
      case 'left':
        player.Board.fallingPiece.moveLeft();
        break;
      case 'right':
        player.Board.fallingPiece.moveRight();
        break;
      case 'stop':
        player.Board.stopGame();
        break;
      case 'down':
        player.Board.fasterSpeed();
        break;
      case 'rotate':
        player.Board.rotatePiece();
        break;
      case 'sprint':
        player.Board.fallSprint();
        break;
    }
  });

  player.startGame();
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, function () {
  console.log('Socket IO server listening on port 3000');
});
