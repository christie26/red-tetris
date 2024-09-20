const pathParts = window.location.pathname.split('/');
const username = pathParts[pathParts.length - 1]; // username is the last part of the path
const roomname = pathParts[pathParts.length - 2]; // room name is the second last of the path

const socket = io({
query: {
  room: roomname,
  username: username
}
});

// To verify that the query parameters are sent to delete later
socket.on('connect', () => {
  console.log('Connected to the server');
  console.log('Room:', roomname, 'Username:', username);
});

for (let i = 0; i < 200; i++) {
  let child = document.createElement('li');
  board.appendChild(child);
}
document.addEventListener('keydown', event => {
  let key = null;
  switch (event.key) {
    case 'ArrowUp':
      key = 'rotate';
      break;
    case 'ArrowDown':
      key = 'down';
      break;
    case 'ArrowLeft':
      key = 'left';
      break;
    case 'ArrowRight':
      key = 'right';
      break;
    case ' ':
      key = 'sprint';
      break;
    case 'Enter':
      key = 'stop';
      break;
  }
  if (key) {
    socket.emit('keyboard', { type: 'keydown', key: key });
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
socket.on('clearLine', data => {
  clearLine(data.y);
});
socket.on('gameover', data => {
  alert('Game Over');
});
function getTypeString(type) {
  switch (type) {
    case 0:
      return 'O_BLOCK';
    case 1:
      return 'I_BLOCK';
    case 2:
      return 'T_BLOCK';
    case 3:
      return 'L_BLOCK';
    case 4:
      return 'J_BLOCK';
    case 5:
      return 'S_BLOCK';
    case 6:
      return 'Z_BLOCK';
  }
}

socket.on('redirect', (url) => {
  window.location.href = url;  // Redirect to the error page
});

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
  const tiles = data;
  const stringType = getTypeString(tiles[0].type);

  board.querySelectorAll('li').forEach(element => {
    if (element.classList.contains('falling')) {
      element.classList.remove(stringType, 'falling');
    }
  });
  tiles.forEach(element => {
    board.children[element.x + (19 - element.y) * 10].classList.add(
      stringType,
      'fixed',
    );
  });
}

function clearLine(y) {
  for (let row = y; row < 19; row++) {
    for (let x = 0; x < 10; x++) {
      const fromIndex = x + (18 - row) * 10;
      const toIndex = x + (19 - row) * 10;

      const fromElement = board.children[fromIndex];
      const toElement = board.children[toIndex];

      toElement.className = fromElement.className;
    }
  }

  for (let x = 0; x < this.width; x++) {
    board.children[x].className = '';
  }
}
