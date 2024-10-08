const pathParts = window.location.pathname.split('/');
const roomname = pathParts[1];
const playername = pathParts[2];
const myboard = document.getElementById('myboard');
const containerWrapper = document.getElementById('containerWrapper');
const info = document.getElementById('info')
const room_info = document.getElementById('room-info')
const player_info = document.getElementById('player-info')
let playing = false;

const socket = io({
  query: {
    room: roomname,
    playername: playername
  }
});

socket.on('connect', () => {
  console.log(`You connected to red-tetris server.`);
  myboard.innerHTML = '';
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      const cellElement = document.createElement('li');
      myboard.appendChild(cellElement)
    }
  }
  room_info.textContent = `Room: ${roomname}`
  const playernameblock = document.createElement('text')
  playernameblock.textContent = playername
  playernameblock.classList.add('big')
  document.getElementById('under-wrapper').appendChild(playernameblock);
});
socket.on('join', (data) => {
  if (data.roomname != roomname)
    return;
  if (data.player == playername) {
    if (data.type == 'leader') {
      console.log(`You joinned ${roomname} as ${playername} as a leader.`);
      toastr.success("You're the leader of this room");
      createButton()
      updatePlayerInfo(data.playerlist)
    } else if (data.type == 'normal') {
      console.log(`You joinned ${roomname} as ${playername} as a player.`);
      toastr.success("You join the room, we are waiting the leader to begin the game")
      updatePlayerInfo(data.playerlist)
    } else if (data.type == 'wait') {
      console.log(`You joinned ${roomname} as ${playername} as a waiter.`);
      player_info.innerHTML = ''
      const text1 = document.createElement('text');
      text1.textContent = 'A game is already playing...'
      player_info.appendChild(text1)
      const text2 = document.createElement('text');
      text2.textContent = 'You should wait until it ends'
      player_info.appendChild(text2)
    }
  } else {
    if (data.type != 'wait')
      updatePlayerInfo(data.playerlist)
  }
});
socket.on('leave', (data) => {
  if (data.roomname != roomname)
    return;

  if (playing) {
    if (data.playername != playername) {
      const board = document.getElementById(data.playername)
      board.classList.add('left')
    }
  } else {
    updatePlayerInfo(data.playerlist)
  }
})
socket.on('newLeader', (data) => {
  if (data.roomname == roomname && data.playername == playername) {
    console.log("You're the newLeader")
    toastr.success("You're the new Leader of this room")
    createButton()
  }
})
socket.on('startgame', (data) => {
  if (data.roomname != roomname)
    return;
  playing = true;
  info.innerHTML = ''
  removeButton()
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
})
socket.on('updateboard', data => {
  if (data.roomname != roomname)
    return;
  if (data.player == playername)
    renderBoard(data.board)
  else if (data.type == 'fixed')
    renderOtherBoard(data)
})
socket.on('gameover', data => {
  if (data.roomname != roomname)
    return;
  if (data.dier == playername) {
    toastr.success('Game Over');
    myboard.classList.add('died')
  } else {
    const board = document.getElementById(data.playername)
    board.classList.add('died')
  }
});
socket.on('endGame', (data) => {
  if (data.roomname != roomname)
    return;
  const winner = data.winner
  if (playing)
    toastr.success(`End Game, The winner is ${winner}`)
  else
    toastr.success("Game Finished, We gonna wait the leader start game to launch it !!")
  playing = false;
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
    socket.emit('keyboard', { type: 'keyup', key: direction });
  }
});
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
function updatePlayerInfo(players) {
  if (players.length == 0)
    return;
  player_info.innerHTML = ''
  const player = document.createElement('text');
  player.textContent = 'Players:'
  player_info.appendChild(player)
  for (let index = 0; index < players.length; index++) {
    const player = document.createElement('text');
    player.textContent = players[index]
    player_info.appendChild(player)
  }
}
function renderBoard(board) {
  myboard.innerHTML = '';
  board.forEach(row => {
    row.forEach(cell => {
      const cellElement = document.createElement('li');
      cellElement.classList.add(getTypeString(cell))
      myboard.appendChild(cellElement);
    });
  });
}
function renderOtherBoard(data) {
  const theirBoard = document.getElementById(data.playername);
  theirBoard.innerHTML = '';
  for (let col = 0; col < 20; col++) {
    for (let row = 0; row < 10; row++) {
      if (data.board[col][row]) {
        for (let target_col = col; target_col < 20; target_col++) {
          data.board[target_col][row] = 1
        }
      }
    }
  }

  data.board.forEach(row => {
    row.forEach(cell => {
      const cellElement = document.createElement('li');
      if (cell)
        cellElement.classList.add('filled')
      theirBoard.appendChild(cellElement);
    });
  });
}
function createButton() {
  if (!document.getElementById('leaderButton')) {
    const leaderButton = document.createElement('button');
    leaderButton.id = 'leaderButton';
    leaderButton.textContent = "Start Game";
    leaderButton.classList.add('button', 'leader');

    leaderButton.addEventListener('click', () => {
      console.log('Leader button clicked');
      socket.emit('leaderClick', { roomname: roomname, playername: playername, });
    });

    document.getElementById('under-wrapper').appendChild(leaderButton);
  }
}
function removeButton() {
  const leaderButton = document.getElementById('leaderButton');
  if (leaderButton) {
    leaderButton.remove();
  }
}
