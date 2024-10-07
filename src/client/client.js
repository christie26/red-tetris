const pathParts = window.location.pathname.split('/');
const roomname = pathParts[1];
const playername = pathParts[2];
// TODO-Balkis : make html, css prettier
const myBoard = document.getElementById('myBoard');
const containerWrapper = document.getElementById('others');

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
    case 20:
      return 'PENALTY';
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
  myBoard.innerHTML = '';
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      const cellElement = document.createElement('li');
      myBoard.appendChild(cellElement)
    }

  }
});
socket.on('join', (data) => {
  if (data.type == 'leader') {
    console.log("You became a leader")
    toastr.success("You're the leader of this room");
    createButton()
  } else if (data.type == 'normal') {
    console.log("join Room")
    toastr.success("You join the room, we are waiting the leader to begin the game")
  } else if (data.type == 'wait') {
    console.log("wait room")
    toastr.success("Game is already started, wait end Game to play in this Room")
  }
});
socket.on('newLeader', () => {
  console.log("You're the newLeader")
  toastr.success("You're the new Leader of this room")
  createButton()
})
socket.on('playerList', (data) => {
  if (data.roomname == roomname) {
    for (const player of data.playerList) {
      if (player == playername) continue;
      const container = document.createElement('div');
      container.classList.add('otherboard-container')
      const board = document.createElement('div')
      board.id = player
      board.classList.add('otherboard')
      const playerName = document.createElement('p');
      playerName.textContent = player;

      containerWrapper.appendChild(container)
      container.appendChild(board)
      container.appendChild(playerName)
    }
  }
})
socket.on('updateboard', data => {
  if (data.playername == playername)
    renderBoard(data.board)
  else
    renderOtherBoard(data)
})
//TODO-Yoonseo : proper change of board when games end.
socket.on('gameover', data => {
  if (data.dier == playername) {
    toastr.success('Game Over');
    // TODO : change my board
  } else {
    //TODO : change dier's board
  }
});
socket.on('endGame', (data) => {
  const winner = data.winner
  if (data.type == 'player')
    toastr.success("End Game, The winner is ", winner)
  else if (data.type == 'waiter')
    toastr.success("Game Finished, We gonna wait the leader start game to launch it !!")
})
socket.on('redirect', (url) => {
  window.location.href = url;
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
    socket.emit('keyboard', { type: 'keydown', key: direction });
  }
});
document.addEventListener('keyup', event => {
  if (event.key === 'ArrowDown') {
    socket.emit('keyboard', { type: 'keyup', direction: 'down' });
  }
});

function renderBoard(board) {
  myBoard.innerHTML = '';
  board.forEach(row => {
    row.forEach(cell => {
      const cellElement = document.createElement('li');
      cellElement.classList.add(getTypeString(cell))
      myBoard.appendChild(cellElement);
    });
  });
}
function renderOtherBoard(data) {
  const theirBoard = document.getElementById(data.playername);
  theirBoard.innerHTML = '';
  data.board.forEach(row => {
    row.forEach(cell => {
      const cellElement = document.createElement('li');
      cellElement.classList.add(getTypeString(cell))
      theirBoard.appendChild(cellElement);
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
function createButton() {
  if (!document.getElementById('leaderButton')) {  // Prevent duplicate buttons
    let leaderButton = document.createElement('button');
    leaderButton.id = 'leaderButton';
    leaderButton.textContent = "Start Game";
    leaderButton.classList.add('btn', 'btn-primary');

    // Add the click event for the leader to start the game
    leaderButton.addEventListener('click', () => {
      console.log('Leader button clicked');
      socket.emit('startGame', { playername: playername, roomname: roomname });
    });

    document.querySelector('.container').appendChild(leaderButton);
  }
}
