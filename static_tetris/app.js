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
  ArrowLeft: movePieceLeft,
  ArrowRight: movePieceRight,
  ArrowDown: fasterSpeed,
  ArrowUp: rotatePiece,
  // TODO: add Space: fixPiece
};

let fixxing = false;

/* Generate new piece and initialization */

init();
function init() {
  for (let i = 0; i < 200; i++) {
    let child = document.createElement('li');
    board.appendChild(child);
  }
  document.addEventListener('keydown', event => {
    movements[event.key](fallingPiece);
  });
  document.addEventListener('keyup', event => {
    if (event.key === 'ArrowDown') {
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
    movePieceDown(fallingPiece);
  }, 200);
}

function movePieceDown(fallingPiece) {
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
    const square = board.children[element + left + 10 * top];
    return square.classList.contains('fixed');
  });
}

/* Moving */
function movePieceLeft(fallingPiece) {
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

function movePieceRight(fallingPiece) {
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

function fasterSpeed(fallingPiece) {
  if (fixxing) {
    return;
  }
  clearInterval(intervalId);
  intervalId = setInterval(function () {
    movePieceDown(fallingPiece);
  }, 50);
}

function resetSpeed(fallingPiece) {
  if (fixxing) {
    return;
  }
  clearInterval(intervalId);
  intervalId = setInterval(function () {
    movePieceDown(fallingPiece);
  }, 200);
}

/* Rotation */
function canRotate(fallingPiece) {
  const nextDirection = (fallingPiece.direction + 1) % 4;
  const elements = pieces[fallingPiece.type][nextDirection];

  for (let element of elements) {
    let col = (element + fallingPiece.left) % 10; // Position of current edge horizontally (in x)
    let row = Math.floor(element / 10) + fallingPiece.top;

    if (
      col < 0 ||
      col >= boardWidth ||
      row >= boardHeight ||
      board.children[
        element + fallingPiece.left + 10 * fallingPiece.top
      ].classList.contains('fixed')
    ) {
      return false;
    }
  }
  return true;
}

function rotatePiece(fallingPiece) {
  if (canRotate(fallingPiece)) {
    if (fixxing) {
      fixxing = false;
      resetSpeed(fallingPiece);
    }
    fallingPiece.direction = (fallingPiece.direction + 1) % 4;
    renderPiece(fallingPiece);
  }
}

/* Render */

function fixPiece() {
  // TODO: end of game (touch ceiling)
  fixxing = true;
  console.log(intervalId);
  clearInterval(intervalId);
  setTimeout(function () {
    if (fixxing) {
      // console.log('fix');
      clearInterval(intervalId);
      renderFixedPiece(fallingPiece);
      fixxing = false;
    }
  }, 2000);
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
  elements[direction].forEach(element => {
    board.children[element + left + 10 * top].classList.remove('falling');
    board.children[element + left + 10 * top].classList.add(type, 'fixed');
  });
  // TODO: clean full lines
  newPiece();
}

// elements: the entire piece with all 4 squares
// element: the position of a square in the piece
// ForEach is applied 4 times, once for each tile / element
// element + left + 10 * top : To draw the piece in the right place (the position
// is already set at the start of the function) as we're in a one-dimensional
// dimension. Left positions on the horizontal axis and (10 = board width) * top
// means that we adjust the distance to the top, lowering the piece top times.

// In the code, there's a one-dimensional array to represent a board that is
// in two dimensions. In code, the board is on a single line but
// which are stacked to make our 2d grid visual.
