const socket = io();

// Create a 10x20 game board
for (let i = 0; i < 200; i++) {
    let child = document.createElement('li');
    board.appendChild(child);
}

// Handle arrow key press and send move event to server
document.addEventListener('keydown', (event) => {
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
  }

  if (direction) {
    socket.emit('move', { direction });
  }
});

// Listen for game state updates from the server
socket.on('update', (data) => {
  const gameState = data.gameState;
  // Update the client-side game interface based on the received game state
});
