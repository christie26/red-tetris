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
  const board = document.getElementById('board');
  for (let i = 0; i < 200; i++) {
    let child = document.createElement('li');
    board.appendChild(child);
  }
  fallingPiece.type = 'zBlock'; // set la classe css qui correspond au type de la piece
  fallingPiece.left = 0;
  fallingPiece.top = 0;
  fallingPiece.direction = 0;
  fallingPiece.elements = pieces.zBlock;
  renderPiece(fallingPiece);

  const movements = {
    // Objet de fonctions
    ArrowLeft: movePieceLeft,
    ArrowRight: movePieceRight,
    ArrowDown: movePieceDown,
    ArrowUp: rotatePiece,
  };

  document.addEventListener('keydown', event => {
    movements[event.key](fallingPiece);
    // if (event.key === 'ArrowLeft') {
    //   movePieceLeft(fallingPiece)
    // } else if (event.key === 'ArrowRight') {
    //   movePieceRight(fallingPiece)
    // } else if (event.key === 'ArrowDown') {
    //   movePieceDown(fallingPiece)
    // } else if (event.key === 'ArrowUp') {
    //   rotatePiece(fallingPiece)
    // }
  });
}

function touchBorder(fallingPiece, moveDirection) {
  const { left, top, direction, elements } = fallingPiece; // On recupere ce qu'il y a dans fallingPiece en faisant une destructuration
  return elements[direction].some(element => {
    // some() : boucle et en plus il teste si un truc est vrai
    const x = (element + left) % 10; // Permet de savoir la position de la piece entre 0 et 9 grace au % a l'horizontal (en sachant que element + left = index dans le board)
    const y = Math.floor(element / 10) + top; // Math.floor arrondit au int en dessous pour eviter les nombres a virgules (element / 10 = index de la ligne dans le board)
    const checks = {
      // Objet de booleen
      left: x < 1,
      right: x >= 9,
      down: y >= 19,
    };
    return checks[moveDirection];
    // if (moveDirection === 'left') {
    //   const check = (element + left) % 10
    //   if (check < 1) {
    //     return true
    //   }
    // } else if (moveDirection === 'right') {
    //   const check = (element + left) % 10
    //   if (check >= 9) {
    //     return true
    //   }
    // } else if (moveDirection === 'down') {
    //   const check = Math.floor(element / 10) + top
    //   console.log("check", check);
    //   if (check >= 19) {
    //     return true
    //   }
    // }
    // return false
  });
}

// Exemple de some():
// function hasPairNb(nbArr) {
//   return nbArr.some(nb => nb % 2 === 0);
// }
// hasPairNb([1, 3, 4, 5]);
// des que some tombe sur pair, il s'arrete et return true
// s'il n'y avait pas de pair, il aurait boucle sur tout le tableau et
// finit par return false

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
  // if (fallingPiece.direction < 3) {
  //   fallingPiece.direction++;
  // } else {
  //   fallingPiece.direction = 0;
  // }
  fallingPiece.direction = (fallingPiece.direction + 1) % 4;
  const center = // position du centre a l'horizontal (en x)
    (fallingPiece.elements[fallingPiece.direction][0] + fallingPiece.left) % 10;

  fallingPiece.elements[fallingPiece.direction].forEach(element => {
    let col = (element + fallingPiece.left) % 10; // Position du carre actuel a l'horizontal (en x)
    const row = Math.floor(element / 10) + fallingPiece.top;
    const boardCenter = 5;
    if (center + boardCenter < col) { // Si le carre actuel est plus grand en x que la moitie du tableau alors le frero est perdu quoi
      fallingPiece.left++;
    } else if (center -  boardCenter > col) {
      fallingPiece.left--;
    } else if (row > 19) {
      fallingPiece.top--;
    }
  });
  renderPiece(fallingPiece);
}

// function fixPiece(fallingPiece, board) {
//   const { type, left, top, direction, elements } = fallingPiece;

//   elements[direction].forEach(element => {
//     const x = left + element % 10;
//     const y = top + Math.floor(element / 10);
//     const position = y * 10 + x;

//     // board.children[element + left + 10 * top].classList.add(type, 'falling');

//     if (position >= 0 && position < board.length) {
//       board.children[position].classList.add(type, 'set');
//     }

//     // board.querySelectorAll('li').forEach(element => {
//     //   element.classList.remove(type, 'falling')
//     // })
//   })
// }

function renderPiece(fallingPiece) {
  const board = document.getElementById('board'); // peut etre mettre en variable globale
  const { type, left, top, direction, elements } = fallingPiece;

  // if (touchBorder(fallingPiece, 'down')) {
  // if () {
  //   fixPiece(fallingPiece, board);
  // }

  board.querySelectorAll('li').forEach(element => {
    element.classList.remove(type, 'falling');
  });
  elements[direction].forEach(element => {
    board.children[element + left + 10 * top].classList.add(type, 'falling');
  });
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
