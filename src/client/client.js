const socket = io();

// Create a 10x20 game board
for (let i = 0; i < 200; i++) {
  let child = document.createElement('li');
  board.appendChild(child);
}

// Handle arrow key press and send move event to server
document.addEventListener('keydown', event => {
  let direction = null;
  switch (event.key) {
    case 'ArrowUp':
      direction = 'rotate';
      break;
    case 'ArrowDown':
      direction = 'down';
      break;
    case 'ArrowLeft':
      direction = 'left';
      break;
    case 'ArrowRight':
      direction = 'right';
      break;
    case ' ':
      direction = 'sprint';
      break;
  }

  if (direction) {
    socket.emit('move', { type: 'keydown', direction: direction });
  }
});

document.addEventListener('keyup', event => {
  if (event.key === 'ArrowDown') {
    socket.emit('move', { type: 'keyup', direction: 'down' });
  }
});

socket.on('update', data => {
  const gameState = data.gameState;
  console.log('Received game state:', gameState);
  // Update the client-side game interface based on the received game state
});
