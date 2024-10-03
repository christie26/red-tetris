const pathParts = window.location.pathname.split('/');
const roomname = pathParts[1]; // room name is the second last of the path
const playername = pathParts[2]; // username is the last part of the path

function getTypeString(type) {
  switch (type) {
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
    case 7:
      return 'O_BLOCK';
    case 11:
      return 'I_BLOCK_FIX';
    case 12:
      return 'T_BLOCK_FIX';
    case 13:
      return 'L_BLOCK_FIX';
    case 14:
      return 'J_BLOCK_FIX';
    case 15:
      return 'S_BLOCK_FIX';
    case 16:
      return 'Z_BLOCK_FIX';
    case 17:
      return 'O_BLOCK_FIX';
  }
}
const socket = io({
query: {
  room: roomname,
  playername: playername
}
});

socket.on('connect', () => {
  console.log(`You joinned ${roomname} as ${playername}`);
});
socket.on('join', (data) => {
  if (data.type == 'leader') {
    console.log("You became a leader")
    // alert("You're the leader of this room")
    //notification("You're the leader of this room") to test at school
    createButton()
  } else if (data.type == 'normal') {
    console.log("join Room")
    alert("You join the room, we are waiting the leader to begin the game")
    //notification("You join the room, we are waiting the leader to begin the game") to test at school
  } else if (data.type == 'wait') {
    console.log("wait room")
    alert("Game is already started, wait end Game to play in this Room")
  }
});
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
socket.on('players', (data) => {
  console.log(data)

})
socket.on('updateboard', data => {
  // console.log(data)
  if(data.playername == playername)
    renderBoard(data.board)
  else
    renderOtherBoard(data)
})
socket.on('gameOver', data => {
  alert('Game Over');
});
socket.on('redirect', (url) => {
  window.location.href = url;  // Redirect to the error page
});
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

const boardElement = document.getElementById('myBoard');

function renderBoard(board) {
  // console.log("board:", board)
  boardElement.innerHTML = '';
  board.forEach(row => {
    row.forEach(cell => {
      const cellElement = document.createElement('li');
      cellElement.classList.add(getTypeString(cell))
      boardElement.appendChild(cellElement);
    });
  });
}
function renderOtherBoard(data) {
  // console.log("board:", data.board)
  boardElement.innerHTML = '';
  data.board.forEach(row => {
    row.forEach(cell => {
      const cellElement = document.createElement('li');
      cellElement.classList.add(getTypeString(cell))
      boardElement.appendChild(cellElement);
    });
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
      socket.emit('startGame', {playername: playername, roomname: roomname});
    });
    // TODO : have to send info of room and player as well.

    document.querySelector('.container').appendChild(leaderButton);
  }
}
