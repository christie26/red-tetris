const pathParts = window.location.pathname.split('/');
const roomname = pathParts[1]; // room name is the second last of the path
const playername = pathParts[2]; // username is the last part of the path

const socket = io({
query: {
  room: roomname,
  playername: playername
}
});

// To verify that the query parameters are sent to delete later
socket.on('connect', () => {
  console.log('Connected to the server');
  console.log('Room:', roomname, 'Playername:', playername);
  console.log(pathParts)
});

socket.on('isLeader', () => {
  console.log("in leader emit")
  alert("You're the leader of this room")
  //notification("You're the leader of this room") to test at school
  createButton()
});

socket.on('joinRoom', () => {
  console.log("join Room")
  alert("You join the room, we are waiting the leader to begin the game")
  //notification("You join the room, we are waiting the leader to begin the game") to test at school
})

socket.on('waitRoom', () => {
  console.log("wait room")
  alert("Game is already started, wait end Game to play in this Room")
})

socket.on('newLeader', () => {
  console.log("You're the newLeader")
  alert("You're the new Leader of this room")
  createButton()
})

socket.on('endGame', (data) => {
  const winner = data.winner
  alert("End Game, The winner is ", winner)
})
socket.on('endGamePlayAgain', () => {
  alert("Game Finished, We gonna wait the leader start game to launch it !!")
})

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
    socket.emit('keyboard', { type: 'keydown', key: direction });
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

function notification(message) {
  // Check if the browser supports notifications
  console.log("in notification function")
    if ("Notification" in window) {
      // Check if the user has already granted permission
      console.log("Notification is allowed")
      if (Notification.permission === "granted") {
        console.log("notification has been created")
        // If permission is granted, create a notification
        showNotification(message);
      }
      // If permission hasn't been granted yet, request it
      else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          // If the user grants permission, create a notification
          console.log("here in denied")
          if (permission === "granted") {
            console.log("notification has been created")
            showNotification(message);
          }
        });
      }
      else {
       console.log("in nothing is ", Notification.permission)
      }
    } else {
      console.log("This browser does not support desktop notifications.");
    }

}

function showNotification(message) {
  console.log("in ShowNotification function")
  const notification = new Notification("Hello!", {
      body: message,
  });

  // Optional: Handle click event
  notification.onclick = function () {
      window.focus(); // Bring the window to focus when notification is clicked
  };
}

function createButton(){
  if (!document.getElementById('leaderButton')) {  // Prevent duplicate buttons
    let leaderButton = document.createElement('button');
    leaderButton.id = 'leaderButton';
    leaderButton.textContent = "Start Game";
    leaderButton.classList.add('btn', 'btn-primary');

    // Add the click event for the leader to start the game
    leaderButton.addEventListener('click', () => {
      console.log('Leader button clicked');
      socket.emit('startGame');
    });

    document.querySelector('.container').appendChild(leaderButton);
  }
}

