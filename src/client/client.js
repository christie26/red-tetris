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

function checkUser() {
  const pathParts = window.location.pathname.split('/');
  const username = pathParts[pathParts.length - 1]; // username is the last part of the path

  console.log("pathParts is ", pathParts);
  if ( username == "") {
    //alert("The right Path should be http://<server_name_or_ip>:<port>/<room>/<player_name>")
  } else {
    console.log("username isssss ", username)
  }
    /*
  fetch(`/checkUser/${username}`)
      .then(response => response.json())
      .then(data => {
          if (data.exists) {
              alert(`User "${username}" already exists!`);
          } else {
              console.log(`User "${username}" does not exist.`);
              console.log("Player have to be added to the room")
          }
      })
      .catch(error => console.error('Error checking user:', error));
*/
  }

function addRoom(){
  const pathParts = window.location.pathname.split('/');
  const roomName= pathParts[pathParts.length - 2]; // room is the second last part of the path

  console.log("the room name is ", roomName)
}

// Call the checkUser function on page load
window.addEventListener('DOMContentLoaded', () => {
  checkUser();
});