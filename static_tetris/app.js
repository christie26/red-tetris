const pieces = {
  oBlock: [
    [0, 1, 10, 11], // Direction 0
    [0, 1, 10, 11], // Direction 1
    [0, 1, 10, 11], // Direction 2
    [0, 1, 10, 11], // Direction 3
  ],
  tBlock: [
    [11, 0, 1, 2], // Le premier de chaque tableau est l'index du centre de la piece (celui qui est commun a chaque rotation)
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
};

init();

function init() {
  const board = document.getElementById('board');
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
  const { left, top, direction, elements } = fallingPiece; // On recupere ce qu'il y a dans fallingPiece en faisant une destructuration
  return elements[direction].some(element => {
    // some() : boucle et en plus il teste si un truc est vrai
    const x = (element + left) % 10; // Permet de savoir la position de la piece entre 0 et 9 grace au % a l'horizontal (en sachant que element + left = index dans le board)
    const y = Math.floor(element / 10) + top; // Math.floor arrondit au int en dessous pour eviter les nombres a virgules (element / 10 = index de la ligne dans le board)
    const checks = {
      left: x < 1,
      right: x >= 9,
      down: y >= 19,
    };
    return checks[moveDirection];
  });
}
function touchOtherPiece(fallingPiece) {
  const { left, top, direction, elements } = fallingPiece;
  return elements[direction].some(element => {
    const board = document.getElementById('board');
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
  if (touchBorder(fallingPiece, 'down')) {
    renderPiece(fallingPiece);
    fixPiece(fallingPiece);
  } else if (touchOtherPiece(fallingPiece)) {
    fallingPiece.top--;
    renderPiece(fallingPiece);
    fixPiece(fallingPiece);
  } else {
    renderPiece(fallingPiece);
  }
  return;
}
function fasterSpeed(fallingPiece) {
  clearInterval(intervalId);
  intervalId = setInterval(function () {
    movePieceDown(fallingPiece);
  }, 50);
}
function resetSpeed(fallingPiece) {
  clearInterval(intervalId);
  intervalId = setInterval(function () {
    movePieceDown(fallingPiece);
  }, 200);
}

function rotatePiece(fallingPiece) {
  fallingPiece.direction = (fallingPiece.direction + 1) % 4;
  const center = // position du centre a l'horizontal (en x)
    (fallingPiece.elements[fallingPiece.direction][0] + fallingPiece.left) % 10;

  fallingPiece.elements[fallingPiece.direction].forEach(element => {
    let col = (element + fallingPiece.left) % 10; // Position du carre actuel a l'horizontal (en x)
    const row = Math.floor(element / 10) + fallingPiece.top;
    const boardCenter = 5;
    if (center + boardCenter < col) {
      // Si le carre actuel est plus grand en x que la moitie du tableau alors le frero est perdu quoi
      fallingPiece.left++;
    } else if (center - boardCenter > col) {
      fallingPiece.left--;
    } else if (row > 19) {
      fallingPiece.top--;
    }
  });
  renderPiece(fallingPiece);
}

function fixPiece() {
  clearInterval(intervalId);
  intervalId = 0;
  setTimeout(function () {
    renderFixedPiece(fallingPiece);
  }, 2000);
}

function renderPiece(fallingPiece) {
  const board = document.getElementById('board'); // peut etre mettre en variable globale
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
  const board = document.getElementById('board');
  const { type, left, top, direction, elements } = fallingPiece;
  board.querySelectorAll('li').forEach(element => {
    if (element.classList.contains('falling', type)) {
      element.classList.remove(type, 'falling');
    }
  });
  elements[direction].forEach(element => {
    board.children[element + left + 10 * top].classList.add(type, 'fixed');
  });
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
