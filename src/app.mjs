import express from 'express';
import http from 'http';
import Server from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  newGame,
  stopGame,
  moveLeft,
  moveRight,
  fasterSpeed,
  rotatePiece,
  fallSprint,
} from './server/tetris.mjs';

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
  socket.on('keyboard', data => {
    switch (data.direction) {
      case 'left':
        moveLeft();
        break;
      case 'right':
        moveRight();
        break;
      case 'stop':
        stopGame();
        break;
      case 'down':
        fasterSpeed();
        break;
      case 'rotate':
        rotatePiece();
        break;
      case 'sprint':
        fallSprint();
        break;
    }
  });

  newGame(socket);
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, function () {
  console.log('Socket IO server listening on port 3000');
});
