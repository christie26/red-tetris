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
    case 'Enter':
      direction = 'stop';
      break;
  }

  if (direction) {
    console.log('Sending move event:', direction);
    socket.emit('keyboard', { type: 'keydown', direction: direction });
  }
});

document.addEventListener('keyup', event => {
  if (event.key === 'ArrowDown') {
    socket.emit('keyboard', { type: 'keyup', direction: 'down' });
  }
});

socket.on('piece', data => {
  const fallingPiece = data.fallingPiece;
  // console.log('Received falling piece:', fallingPiece);
  renderPiece(fallingPiece);
});

socket.on('fixPiece', data => {
  const fallingPiece = data.fallingPiece;
  renderFixedPiece(fallingPiece);
});
function getTypeString(type) {
  switch (type) {
    case 0:
      return 'O_BLOCK';
    case 1:
      return 'T_BLOCK';
    case 2:
      return 'J_BLOCK';
    case 3:
      return 'L_BLOCK';
    case 4:
      return 'S_BLOCK';
    case 5:
      return 'Z_BLOCK';
    case 6:
      return 'I_BLOCK';
  }
}
function renderPiece(fallingPiece) {
  const { type, left, top, direction, elements } = fallingPiece;

  stringType = getTypeString(type);
  board.querySelectorAll('li').forEach(element => {
    if (element.classList.contains('falling')) {
      element.classList.remove(stringType, 'falling');
    }
  });
  elements[direction].forEach(element => {
    board.children[element + left + 10 * top].classList.add(
      stringType,
      'falling',
    );
  });
}
function renderFixedPiece(fallingPiece) {
  const { type, left, top, direction, elements } = fallingPiece;
  stringType = getTypeString(type);
  elements[direction].forEach(element => {
    board.children[element + left + 10 * top].classList.remove(
      stringType,
      'falling',
    );
    board.children[element + left + 10 * top].classList.add(
      stringType,
      'fixed',
    );
  });
}
