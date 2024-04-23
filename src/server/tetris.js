const PieceType = {
  O_BLOCK: 0,
  T_BLOCK: 1,
  J_BLOCK: 2,
  L_BLOCK: 3,
  S_BLOCK: 4,
  Z_BLOCK: 5,
  I_BLOCK: 6,
};

const piecesArray = [
  [
    // O_BLOCK
    [0, 1, 10, 11], // Direction 0
    [0, 1, 10, 11], // Direction 1
    [0, 1, 10, 11], // Direction 2
    [0, 1, 10, 11], // Direction 3
  ],
  [
    // T_BLOCK
    [11, 0, 1, 2], // Direction 0
    [11, 2, 12, 22], // Direction 1
    [11, 20, 21, 22], // Direction 2
    [11, 0, 10, 20], // Direction 3
  ],
  [
    // J_BLOCK
    [11, 0, 10, 12], // Direction 0
    [11, 1, 2, 21], // Direction 1
    [11, 10, 12, 22], // Direction 2
    [11, 20, 21, 1], // Direction 3
  ],
  [
    // L_BLOCK
    [11, 20, 10, 12], // Direction 0
    [11, 1, 0, 21], // Direction 1
    [11, 10, 12, 2], // Direction 2
    [11, 22, 21, 1], // Direction 3
  ],
  [
    // S_BLOCK
    [11, 1, 2, 10], // Direction 0
    [11, 22, 12, 1], // Direction 1
    [11, 12, 20, 21], // Direction 2
    [11, 0, 10, 21], // Direction 3
  ],
  [
    // Z_BLOCK
    [11, 1, 0, 12], // Direction 0
    [11, 2, 12, 21], // Direction 1
    [11, 10, 21, 22], // Direction 2
    [11, 1, 10, 20], // Direction 3
  ],
  [
    // I_BLOCK
    [1, 0, 2, 3], // Direction 0
    [11, 1, 21, 31], // Direction 1
    [1, 0, 2, 3], // Direction 2
    [11, 1, 21, 31], // Direction 3
  ],
];

let fallingPiece = {
  type: 0,
  left: 0,
  top: 0,
  direction: 0,
  elements: null,
};
const initPiece = {
  type: 0,
  left: 0,
  top: 0,
  direction: 0,
  elements: null,
};
let socket = null;
let boardArray = new Array(200).fill(0);

const boardWidth = 10;
const boardHeight = 20;
const falling = 10;
const fixed = 20;
let intervalId;
let fixxing = false;
let sprint = false;
let fastSpeed = false;

function newGame(gameSocket) {
  boardArray.forEach(index => {
    boardArray[index] = 0;
  });
  socket = gameSocket;
  clearInterval(intervalId);
  newPiece();
}

function stopGame() {
  clearInterval(intervalId);
}
function newPiece() {
  sprint = false;
  fixxing = false;
  fastSpeed = false;
  const randomKey = Math.floor(Math.random() * 7);
  fallingPiece = { ...initPiece };
  fallingPiece.type = randomKey;
  fallingPiece.left = 2 + Math.floor(Math.random() * 5);
  fallingPiece.top = 0;
  fallingPiece.direction = 0;
  fallingPiece.elements = piecesArray[randomKey];
  for (element of fallingPiece.elements[fallingPiece.direction]) {
    if (boardArray[element + fallingPiece.left] > fixed) {
      socket.emit('piece', { fallingPiece });
      alert('Game Over');
      return;
    }
  }
  renderPiece(fallingPiece);

  intervalId = setInterval(function () {
    moveDown(fallingPiece);
  }, 200);
}

/* Move Down */
function moveDown(fallingPiece) {
  if (fallingPiece.top <= boardHeight) {
    fallingPiece.top++;
    if (touchOtherPiece(fallingPiece)) {
      fallingPiece.top--;
      fixPiece(fallingPiece);
    } else if (availableToMove(fallingPiece, 'down')) {
      renderPiece(fallingPiece);
      fixPiece(fallingPiece);
    } else {
      renderPiece(fallingPiece);
    }
    return;
  }
}

/* Check before move */
function availableToMove(fallingPiece, moveDirection) {
  const { left, top, direction, elements } = fallingPiece;
  return elements[direction].some(element => {
    const x = (element + left) % 10;
    const y = Math.floor(element / 10) + top;
    const checks = {
      left: x < 1,
      right: x >= boardWidth - 1,
      down: y >= boardHeight - 1,
    };
    return checks[moveDirection];
  });
}

function touchOtherPiece(fallingPiece) {
  const { left, top, direction, elements } = fallingPiece;
  return elements[direction].some(element => {
    if (element + left + 10 * top > 199) {
      return true;
    }
    return boardArray[element + left + 10 * top] > fixed;
  });
}

/* Moving */
function moveLeft() {
  if (!availableToMove(fallingPiece, 'left')) {
    fallingPiece.left--;
    if (touchOtherPiece(fallingPiece)) {
      fallingPiece.left++;
    }
    if (fixxing && !availableToMove(fallingPiece, 'down')) {
      fixxing = false;
      fastSpeed = true;
      resetSpeed(fallingPiece);
    }
    renderPiece(fallingPiece);
  }
}

function moveRight() {
  if (!availableToMove(fallingPiece, 'right')) {
    fallingPiece.left++;
    if (touchOtherPiece(fallingPiece)) {
      fallingPiece.left--;
    }
    if (fixxing && !availableToMove(fallingPiece, 'down')) {
      fixxing = false;
      fastSpeed = true;
      resetSpeed(fallingPiece);
    }
    renderPiece(fallingPiece);
  }
}

/* ArrowDown */
function fasterSpeed() {
  if (fastSpeed || fixxing) {
    return;
  }
  clearInterval(intervalId);
  intervalId = setInterval(function () {
    moveDown(fallingPiece);
  }, 50);
  fastSpeed = true;
}

function resetSpeed() {
  if (!fastSpeed || fixxing) {
    return;
  }
  clearInterval(intervalId);
  intervalId = setInterval(function () {
    moveDown(fallingPiece);
  }, 200);
  fastSpeed = false;
}

/* SpaceBar */
function fallSprint() {
  sprint = true;
  if (fixxing) {
    clearInterval(intervalId);
    return;
  }
  clearInterval(intervalId);
  intervalId = setInterval(function () {
    moveDown(fallingPiece);
  }, 5);
}

/* Rotation */
function checkBorderRotate() {
  const nextDirection = (fallingPiece.direction + 1) % 4;
  const center = // position du centre a l'horizontal (en x)
    (fallingPiece.elements[nextDirection][0] + fallingPiece.left) % 10;
  fallingPiece.elements[nextDirection].forEach(element => {
    let col = (element + fallingPiece.left) % 10;
    const row = Math.floor(element / 10) + fallingPiece.top;
    const boardCenter = 5;
    if (center + boardCenter < col) {
      fallingPiece.left++;
      return 'left';
    } else if (center - boardCenter > col) {
      fallingPiece.left--;
      return 'right';
    } else if (row > 19) {
      fallingPiece.top--;
      return 'up';
    }
  });
}

function rotatePiece() {
  const adjustMove = checkBorderRotate(fallingPiece);
  let tempPiece = { ...fallingPiece };
  tempPiece.direction = (tempPiece.direction + 1) % 4;
  if (!touchOtherPiece(tempPiece)) {
    if (fixxing) {
      fixxing = false;
      fastSpeed = true;
      resetSpeed(fallingPiece);
    }
    fallingPiece.direction = (fallingPiece.direction + 1) % 4;
    renderPiece(fallingPiece);
  } else {
    if (adjustMove === 'left') {
      fallingPiece.left--;
    } else if (adjustMove === 'right') {
      fallingPiece.left++;
    } else if (adjustMove === 'up') {
      fallingPiece.top++;
    }
  }
}

/* Render */
function fixPiece() {
  if (sprint) {
    clearInterval(intervalId);
    renderFixedPiece(fallingPiece);
  } else {
    fixxing = true;
    clearInterval(intervalId);
    setTimeout(function () {
      if (fixxing) {
        clearInterval(intervalId);
        renderFixedPiece(fallingPiece);
      }
    }, 1000);
  }
}

function renderPiece(fallingPiece) {
  const { type, left, top, direction, elements } = fallingPiece;

  boardArray.forEach((element, index) => {
    if (element > falling && element < fixed) {
      boardArray[index] = 0;
    }
  });
  socket.emit('piece', { fallingPiece });

  elements[direction].forEach(element => {
    boardArray[element + left + 10 * top] = falling + type;
  });
}

function renderFixedPiece(fallingPiece) {
  const { type, left, top, direction, elements } = fallingPiece;
  // const lines = [];
  elements[direction].forEach(element => {
    boardArray[element + left + 10 * top] += 10;
    // lines.push(Math.floor((element + left + 10 * top) / 10));
  });
  socket.emit('fixPiece', { fallingPiece });
  // lines.forEach(line => {
  //   clearLine(line);
  // });

  newPiece();
}

// function clearLine(line) {
//   for (element = line * 10; element < line * 10 + 10; element++) {
//     if (!board.children[element].classList.contains('fixed')) {
//       return;
//     }
//   }
//   for (element = line * 10; element < line * 10 + 10; element++) {
//     const classes = Array.from(board.children[element].classList);
//     board.children[element].classList.remove(...classes);
//   }
//   for (let element = line * 10 - 1; element >= 0; element--) {
//     if (board.children[element].classList.contains('fixed')) {
//       const classes = Array.from(board.children[element].classList);
//       board.children[element].classList.remove(...classes);
//       board.children[element + 10].classList.add(...classes);
//     }
//   }
// }

module.exports = {
  newGame,
  stopGame,
  moveLeft,
  moveRight,
  fasterSpeed,
  rotatePiece,
  fallSprint,
};
