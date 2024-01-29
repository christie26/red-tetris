const board = document.getElementById('board');
const boardWidth = 9;
const boardHeight = 19;

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

const fallingPiece = {
  type: null,
  left: 0,
  top: 0,
  direction: 0,
  elements: null,
};

// Init
init();

function init() {
  for (let i = 0; i < 200; i++) {
    let child = document.createElement('li');
    board.appendChild(child);
  }
  fallingPiece.type = 'zBlock'; // set the css class that corresponds to the piece type
  fallingPiece.left = 0;
  fallingPiece.top = 0;
  fallingPiece.direction = 0;
  fallingPiece.elements = pieces.zBlock;
  renderPiece(fallingPiece);

  const movements = {
    // Function object
    ArrowLeft: movePieceLeft,
    ArrowRight: movePieceRight,
    ArrowDown: movePieceDown,
    ArrowUp: rotatePiece,
  };

  document.addEventListener('keydown', event => {
    movements[event.key](fallingPiece);
  });
}

function touchBorder(fallingPiece, moveDirection) {
  const { left, top, direction, elements } = fallingPiece; // Recover what's in fallingPiece by destructuring it
  return elements[direction].some(element => {
    // some(): loop and also tests if something is true
    const x = (element + left) % 10; // Find the position of the piece between 0 and 9 using the horizontal % (knowing that element + left = index in the board)
    const y = Math.floor(element / 10) + top; // Math.floor rounds down to the nearest int to avoid comma-delimited numbers (element / 10 = line index in the board)
    const checks = {
      // Boolean object
      left: x < 1,
      right: x >= boardWidth,
      down: y >= boardHeight,
    };
    return checks[moveDirection];
  });
}

function movePieceLeft(fallingPiece) {
  if (!touchBorder(fallingPiece, 'left')) {
    fallingPiece.left--;
    renderPiece(fallingPiece);
  }
}

function movePieceRight(fallingPiece) {
  if (!touchBorder(fallingPiece, 'right')) {
    fallingPiece.left++;
    renderPiece(fallingPiece);
  }
}

function movePieceDown(fallingPiece) {
  if (!touchBorder(fallingPiece, 'down')) {
    fallingPiece.top++;
    renderPiece(fallingPiece);
  }
}

function rotatePiece(fallingPiece) {
  fallingPiece.direction = (fallingPiece.direction + 1) % 4;
  const center = // horizontal center position (in x)
    (fallingPiece.elements[fallingPiece.direction][0] + fallingPiece.left) % 10;

  fallingPiece.elements[fallingPiece.direction].forEach(element => {
    let col = (element + fallingPiece.left) % 10; // Position of current edge horizontally (in x)
    const row = Math.floor(element / 10) + fallingPiece.top;
    const boardCenter = 5;
    if (center + boardCenter < col) {
      // If the current edge is larger in x than half the array, then the frero is lost.
      fallingPiece.left++;
    } else if (center - boardCenter > col) {
      fallingPiece.left--;
    } else if (row > boardHeight) {
      fallingPiece.top--;
    }
  });
  renderPiece(fallingPiece);
}

function renderPiece(fallingPiece) {
  const { type, left, top, direction, elements } = fallingPiece;

  fallingPiece.elements[fallingPiece.direction].forEach(element => {
    const row = Math.floor(element / 10) + fallingPiece.top;
    if (row < boardHeight) {
      board.querySelectorAll('li').forEach(element => {
        element.classList.remove(type); // Falling
      });
      elements[direction].forEach(element => {
        board.children[element + left + 10 * top].classList.add(type); // Falling
      });
    } else {
    }
  });
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
