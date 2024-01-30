const pieces = {
  oBlock: [
    [0, 1, 10, 11], // Direction 0
    [0, 1, 10, 11], // Direction 1
    [0, 1, 10, 11], // Direction 2
    [0, 1, 10, 11], // Direction 3
  ],
  tBlock: [
    [11, 0, 1, 2], // The first of each table is the index of the center of the piece (the one common to each rotation).
    [11, 2, 12, 22],
    [11, 20, 21, 22],
    [11, 0, 10, 20],
  ],
  jBlock: [
    [11, 0, 10, 12],
    [11, 1, 2, 21],
    [11, 10, 12, 22],
    [11, 20, 21, 1],
  ],
  lBlock: [
    [11, 20, 10, 12],
    [11, 1, 0, 21],
    [11, 10, 12, 2],
    [11, 22, 21, 1],
  ],
  sBlock: [
    [11, 1, 2, 10],
    [11, 22, 12, 1],
    [11, 12, 20, 21],
    [11, 0, 10, 21],
  ],
  zBlock: [
    [11, 1, 0, 12],
    [11, 2, 12, 21],
    [11, 10, 21, 22],
    [11, 1, 10, 20],
  ],
  iBlock: [
    [11, 10, 12, 13],
    [11, 1, 21, 31],
    [11, 10, 12, 13],
    [11, 1, 21, 31],
  ],
};

let intervalId;

const board = document.getElementById('board');
const boardWidth = 9;
const boardHeight = 19;

let fallingPiece = {
  type: null,
  left: 0,
  top: 0,
  direction: 0,
  elements: null,
};
const initPiece = {
  type: null,
  left: 0,
  top: 0,
  direction: 0,
  elements: null,
};

const movements = {
  ArrowLeft: moveLeft,
  ArrowRight: moveRight,
  ArrowDown: fasterSpeed,
  ArrowUp: rotatePiece,
  ' ': fallSprint,
};

let fixxing = false;
let sprint = false;

/* Generate new piece and initialization */

init();
function init() {
  for (let i = 0; i < 200; i++) {
    let child = document.createElement('li');
    board.appendChild(child);
  }
  document.addEventListener('keydown', e => {
    if (movements.hasOwnProperty(e.key)) {
      movements[e.key](fallingPiece);
    }
  });
  document.addEventListener('keyup', e => {
    if (e.key === 'ArrowDown') {
      resetSpeed(fallingPiece);
    }
  });
}
function newGame() {
  board.querySelectorAll('li').forEach(element => {
    element.classList.remove(
      'fixed',
      'falling',
      'oBlock',
      'tBlock',
      'jBlock',
      'lBlock',
      'sBlock',
      'zBlock',
      'iBlock',
    );
  });
  clearInterval(intervalId);
  newPiece();
}
function stopGame() {
  clearInterval(intervalId);
}
function newPiece() {
  sprint = false;
  fixxing = false;
  const keys = Object.keys(pieces);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  fallingPiece = { ...initPiece };
  fallingPiece.type = randomKey;
  fallingPiece.left = 2 + Math.floor(Math.random() * 5);
  fallingPiece.top = 0;
  fallingPiece.direction = 0;
  fallingPiece.elements = pieces[randomKey];
  renderPiece(fallingPiece);

  intervalId = setInterval(function () {
    moveDown(fallingPiece);
  }, 200);
}

function moveDown(fallingPiece) {
  if (fallingPiece.top < boardHeight) {
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
      right: x >= boardWidth,
      down: y >= boardHeight,
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
    const square = board.children[element + left + 10 * top];
    console.log(element + left + 10 * top);
    return square.classList.contains('fixed');
  });
}

/* Moving */
function moveLeft(fallingPiece) {
  if (!availableToMove(fallingPiece, 'left')) {
    fallingPiece.left--;
    if (touchOtherPiece(fallingPiece)) {
      fallingPiece.left++;
    }
    if (fixxing && !availableToMove(fallingPiece, 'down')) {
      fixxing = false;
      resetSpeed(fallingPiece);
    }
    renderPiece(fallingPiece);
  }
}

function moveRight(fallingPiece) {
  if (!availableToMove(fallingPiece, 'right')) {
    fallingPiece.left++;
    if (touchOtherPiece(fallingPiece)) {
      fallingPiece.left--;
    }
    if (fixxing && !availableToMove(fallingPiece, 'down')) {
      fixxing = false;
      resetSpeed(fallingPiece);
    }
    renderPiece(fallingPiece);
  }
}

/* ArrowDown */
function fasterSpeed(fallingPiece) {
  if (fixxing) {
    return;
  }
  clearInterval(intervalId);
  intervalId = setInterval(function () {
    moveDown(fallingPiece);
  }, 50);
}

function resetSpeed(fallingPiece) {
  if (fixxing) {
    return;
  }
  clearInterval(intervalId);
  intervalId = setInterval(function () {
    moveDown(fallingPiece);
  }, 200);
}

/* SpaceBar */
function fallSprint(fallingPiece) {
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
function checkBorderRotate(fallingPiece) {
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

function rotatePiece(fallingPiece) {
  const adjustMove = checkBorderRotate(fallingPiece);
  let tempPiece = { ...fallingPiece };
  tempPiece.direction = (tempPiece.direction + 1) % 4;
  if (!touchOtherPiece(tempPiece)) {
    if (fixxing) {
      fixxing = false;
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
  // TODO: end of game (touch ceiling)
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
    }, 2000);
  }
}

function renderPiece(fallingPiece) {
  const { type, left, top, direction, elements } = fallingPiece;

  board.querySelectorAll('li').forEach(element => {
    if (element.classList.contains('falling')) {
      element.classList.remove(type, 'falling');
    }
  });
  elements[direction].forEach(element => {
    board.children[element + left + 10 * top].classList.add(type, 'falling');
  });
}

function renderFixedPiece(fallingPiece) {
  const { type, left, top, direction, elements } = fallingPiece;
  const lines = [];
  elements[direction].forEach(element => {
    board.children[element + left + 10 * top].classList.remove('falling');
    board.children[element + left + 10 * top].classList.add(type, 'fixed');
    lines.push(Math.floor((element + left + 10 * top) / 10));
  });
  lines.forEach(line => {
    clearLine(line);
  });

  newPiece();
}

function clearLine(line) {
  for (element = line * 10; element < line * 10 + 10; element++) {
    if (!board.children[element].classList.contains('fixed')) {
      return;
    }
  }
  for (element = line * 10; element < line * 10 + 10; element++) {
    const classes = Array.from(board.children[element].classList);
    board.children[element].classList.remove(...classes);
  }
  for (let element = line * 10 - 1; element >= 0; element--) {
    if (board.children[element].classList.contains('fixed')) {
      const classes = Array.from(board.children[element].classList);
      board.children[element].classList.remove(...classes);
      board.children[element + 10].classList.add(...classes);
    }
  }
}
