const pieces = {
  oBlock: [
    [0, 1, 10, 11],
    [0, 1, 10, 11],
    [0, 1, 10, 11],
    [0, 1, 10, 11],
  ],
  tBlock: [
    [0, 1, 2, 11],
    [2, 12, 22, 11],
    [20, 21, 22, 11],
    [0, 10, 20, 11],
  ],
  jBlock: [
    [0, 10, 11, 12],
    [1, 2, 11, 21],
    [10, 11, 12, 22],
    [20, 21, 11, 1],
  ],
  lBlock: [
    [20, 10, 11, 12],
    [1, 0, 11, 21],
    [10, 11, 12, 2],
    [22, 21, 11, 1],
  ],
  sBlock: [
    [1, 2, 10, 11],
    [22, 12, 11, 1],
    [1, 2, 10, 11],
    [22, 12, 11, 1],
  ],
  zBlock: [
    [1, 0, 12, 11],
    [2, 12, 11, 21],
    [1, 0, 12, 11],
    [2, 12, 11, 21],
  ],
  iBlock: [
    [0, 1, 2, 3],
    [1, 11, 21, 31],
    [0, 1, 2, 3],
    [1, 11, 21, 31],
  ],
}

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
  fallingPiece.type = 'tBlock'
  fallingPiece.left = 0
  fallingPiece.top = 0
  fallingPiece.direction = 0
  fallingPiece.elements = pieces.tBlock
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
function touchBorder(fallingPiece, moveDirection) {
  const { left, top, direction, elements } = fallingPiece
  return elements[direction].some(element => {
    if (moveDirection === 'left') {
      const check = (element + left) % 10
      if (check < 1) {
        return true
      }
    } else if (moveDirection === 'right') {
      const check = (element + left) % 10
      if (check > 8) {
        return true
      }
    } else if (moveDirection === 'down') {
      const check = element / 10 + top
      if (check > 19) {
        return true
      }
    }
    return false
  })
}
function movePieceLeft(fallingPiece) {
  if (!touchBorder(fallingPiece, 'left')) {
    fallingPiece.left--
    renderPiece(fallingPiece)
  }
}
function movePieceRight(fallingPiece) {
  if (!touchBorder(fallingPiece, 'right')) {
    fallingPiece.left++
    renderPiece(fallingPiece)
  }
}
function movePieceDown(fallingPiece) {
  if (!touchBorder(fallingPiece, 'down')) {
    fallingPiece.top++
    renderPiece(fallingPiece)
  }
}
function rotatePiece(fallingPiece) {
  if (fallingPiece.direction < 3) {
    fallingPiece.direction++
  } else {
    fallingPiece.direction = 0
  }
  fallingPiece.elements.forEach(element => {})
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
