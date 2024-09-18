const socket = io();

for (let i = 0; i < 200; i++) {
  let child = document.createElement('li');
  board.appendChild(child);
}
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

socket.on('fallingPiece', data => {
  renderPiece(data.data);
});
socket.on('fixPiece', data => {
  renderFixedPiece(data.data);
});

socket.on('gameOver', data => {
  alert('Game Over');
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
function renderPiece(data) {
  const tilesArray = data;
  const stringType = getTypeString(tilesArray[0].type);

  board.querySelectorAll('li').forEach(element => {
    if (element.classList.contains('falling')) {
      element.classList.remove(stringType, 'falling');
    }
  });
  tilesArray.forEach(element => {
    board.children[element.x + (19 - element.y) * 10].classList.add(
      stringType,
      'falling',
    );
  });
}
function renderFixedPiece(data) {
  const tilesArray = data;
  const stringType = getTypeString(tilesArray[0].type);

  console.log(tilesArray)
  board.querySelectorAll('li').forEach(element => {
    if (element.classList.contains('falling')) {
      element.classList.remove(stringType, 'falling');
    }
  });
  tilesArray.forEach(element => {
    console.log(element);
    board.children[element.x + (19 - element.y) * 10].classList.add(
      stringType,
      'fixed',
    );
  });
}

function pauseGame() {
  console.log('pause');
  socket.emit('pause', { data: 'pause' });
}
function playGame() {
  console.log('pause');
  socket.emit('pause', { data: 'play' });
}

// Parising Url 
// receive URL
console
document.addEventListener('DOMContentLoaded', () => {
  const urlString = window.location.href;
  const url = new URL(urlString);
  console.log("url is -> ", url)
  // Your parsing logic here
});
