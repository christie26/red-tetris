const pieces = [
  (square = [
    [0, 1, 10, 11],
    [0, 1, 10, 11],
  ]),
  (tree = [
    [0, 1, 2, 11],
    [2, 12, 22, 11],
    [20, 21, 22, 11],
    [0, 10, 20, 11],
  ]),
]

const fallingPiece = {
  type: null,
  left: 0,
  top: 0,
  direction: 0,
  elements: null,
}
// Init
init()

function init() {
  const board = document.getElementById('board')
  for (let i = 0; i < 200; i++) {
    let child = document.createElement('li')
    board.appendChild(child)
  }
  fallingPiece.type = 'tree'
  fallingPiece.left = 0
  fallingPiece.top = 0
  fallingPiece.direction = 0
  fallingPiece.elements = pieces[1]
  renderPiece(fallingPiece)

  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      movePieceLeft(fallingPiece)
    } else if (event.key === 'ArrowRight') {
      movePieceRight(fallingPiece)
    } else if (event.key === 'ArrowDown') {
      movePieceDown(fallingPiece)
    } else if (event.key === 'ArrowUp') {
      rotatePiece(fallingPiece)
    }
  })
}
function movePieceLeft(fallingPiece) {
  if (fallingPiece.left > 0) {
    fallingPiece.left--
  }
  renderPiece(fallingPiece)
}
function movePieceRight(fallingPiece) {
  if (fallingPiece.left < 9) {
    fallingPiece.left++
  }
  renderPiece(fallingPiece)
}
function rotatePiece(fallingPiece) {
  if (fallingPiece.direction < 3) {
    fallingPiece.direction++
  } else {
    fallingPiece.direction = 0
  }
  renderPiece(fallingPiece)
}

function renderPiece(fallingPiece) {
  const board = document.getElementById('board')
  const { type, left, top, direction, elements } = fallingPiece

  board.querySelectorAll('li').forEach(element => {
    element.classList.remove(type, 'falling')
  })
  elements[direction].forEach(element => {
    board.children[element + left + 10 * top].classList.add(type, 'falling')
  })
}
