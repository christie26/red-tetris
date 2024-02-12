let app = require('express')();
let express = require('express');
let server = require('http').createServer(app);
let io = require('socket.io')(server);
let path = require('path');

app.get('/socket.io/socket.io.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});

app.use('/', express.static(path.join(__dirname, 'client')));

io.on('connection', function (socket) {
  socket.on('move', data => {
    console.log('Received move event:', data);
    // io.emit('update', { gameState });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, function () {
  console.log('Socket IO server listening on port 3000');
});
