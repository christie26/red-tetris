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
let intervalId;
const board = document.getElementById('board');
const fallingPiece = {
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

function newPiece() {
  const keys = Object.keys(pieces);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
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

function touchBorder(fallingPiece, moveDirection) {
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
function movePieceLeft(fallingPiece) {
  if (!touchBorder(fallingPiece, 'left')) {
    fallingPiece.left--;
    if (touchOtherPiece(fallingPiece)) {
      fallingPiece.left++;
    }
    renderPiece(fallingPiece);
  }
}
function movePieceRight(fallingPiece) {
  if (!touchBorder(fallingPiece, 'right')) {
    fallingPiece.left++;
    if (touchOtherPiece(fallingPiece)) {
      fallingPiece.left--;
    }
    renderPiece(fallingPiece);
  }
}

function movePieceDown(fallingPiece) {
  fallingPiece.top++;
  if (touchOtherPiece(fallingPiece)) {
    fallingPiece.top--;
    fixPiece(fallingPiece);
  } else if (touchBorder(fallingPiece, 'down')) {
    renderPiece(fallingPiece);
    fixPiece(fallingPiece);
  } else {
    renderPiece(fallingPiece);
  }
  return;
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

function rotatePiece(fallingPiece) {
  fallingPiece.direction = (fallingPiece.direction + 1) % 4;
  const center = // horizontal center position (in x)
    (fallingPiece.elements[fallingPiece.direction][0] + fallingPiece.left) % 10;

  fallingPiece.elements[fallingPiece.direction].forEach(element => {
    let col = (element + fallingPiece.left) % 10; // Position of current edge horizontally (in x)
    const row = Math.floor(element / 10) + fallingPiece.top;
    const boardCenter = 5;
    if (center + boardCenter < col) {
      fallingPiece.left++;
    } else if (center - boardCenter > col) {
      fallingPiece.left--;
    } else if (row > boardHeight) {
      fallingPiece.top--;
    }
  });
  renderPiece(fallingPiece);
}

function fixPiece() {
  // TODO: possible to go down more
  // TODO: end of game (touch ceiling)
  fixxing = true;
  clearInterval(intervalId);
  setTimeout(function () {
    renderFixedPiece(fallingPiece);
    fixxing = false;
  }, 2000);
}

function renderPiece(fallingPiece) {
  const { type, left, top, direction, elements } = fallingPiece;

  board.querySelectorAll('li').forEach(element => {
    if (element.classList.contains('falling', type)) {
      element.classList.remove(type, 'falling');
    }
  });
  elements[direction].forEach(element => {
    board.children[element + left + 10 * top].classList.add(type, 'falling');
  });
}

function renderFixedPiece(fallingPiece) {
  const { type, left, top, direction, elements } = fallingPiece;
  board.querySelectorAll('li').forEach(element => {
    if (element.classList.contains('falling', type)) {
      element.classList.remove(type, 'falling');
    }
  });
  elements[direction].forEach(element => {
    board.children[element + left + 10 * top].classList.add(type, 'fixed');
  });
  // TODO: clean full lines
  newPiece();
}

// elements: La piece entiere avec les 4 carres
// element: c'est la position d'un carre de la piece
// ForEach s'applique 4 fois, une fois pour chaque carre / element
// element + left + 10 * top : Pour dessiner la piece au bon endroit (la position
// est deja set au debut de la fonction) car on est dans un tableau en une
// dimension. Left positionne sur l'axe horizontal et (10 = largeur du board) * top
// veut dire que l'on ajuste la distance avec le haut, on baisse la piece de top fois.

// Dans le code, il y a un tableau d'une dimension pour representer un board qui est
// lui en deux dimensions. Le tableau en code est que sur une seule ligne mais
// qui sont empilees pour faire notre grille en 2d visuellement.
