class Board {
  constructor(socket) {
    this.socket = socket;
    this.boardWidth = 10;
    this.boardHeight = 20;
    this.fallingStatus = 10;
    this.fixedStatus = 20;
    this.intervalId = null;
  
    this.fixing = false;
    this.sprint = false;
    this.fastSpeed = false;
    this.initGame();
  }

  initGame() {
    this.boardArray = new Array(200).fill(0);
    clearInterval(this.intervalId);
    this.newPiece();
  }

  newPiece() {
    this.sprint = false;
    this.fixing = false;
    this.fastSpeed = false;
    const randomKey = Math.floor(Math.random() * 7);
    this.fallingPiece = { ...this.initPiece };
    this.fallingPiece.type = randomKey;
    this.fallingPiece.left = 2 + Math.floor(Math.random() * 5);
    this.fallingPiece.top = 0;
    this.fallingPiece.direction = 0;
    this.fallingPiece.elements = this.piecesArray[randomKey];

    if (this.touchOtherPiece(this.fallingPiece)) {
      this.socket.emit('piece', { fallingPiece: this.fallingPiece });
      alert('Game Over');
      return;
    }

    this.renderPiece();
    this.intervalId = setInterval(() => this.moveDown(), 200);
  }

  moveDown() {
    if (this.fallingPiece.top <= this.boardHeight) {
      this.fallingPiece.top++;
      if (this.touchOtherPiece(this.fallingPiece)) {
        this.fallingPiece.top--;
        this.fixPiece();
      } else if (this.availableToMove('down')) {
        this.renderPiece();
        this.fixPiece();
      } else {
        this.renderPiece();
      }
      return;
    }
  }

  // Check if the falling piece can move in the specified direction
  availableToMove(moveDirection) {
    const { left, top, direction, elements } = this.fallingPiece;
    return elements[direction].some(element => {
      const x = (element + left) % 10;
      const y = Math.floor(element / 10) + top;
      const checks = {
        left: x < 1,
        right: x >= this.boardWidth - 1,
        down: y >= this.boardHeight - 1,
      };
      return checks[moveDirection];
    });
  }

  // Check if the falling piece touches other fixed pieces
  touchOtherPiece() {
    const { left, top, direction, elements } = this.fallingPiece;
    return elements[direction].some(element => {
      if (element + left + 10 * top > 199) {
        return true;
      }
      return this.boardArray[element + left + 10 * top] > this.fixedStatus;
    });
  }

  // Move the falling piece left
  moveLeft() {
    if (!availableToMove(this.fallingPiece, 'left')) {
      this.fallingPiece.left--;
      if (touchOtherPiece(this.fallingPiece)) {
        this.fallingPiece.left++;
      }
      if (this.fixxing && !availableToMove(this.fallingPiece, 'down')) {
        this.fixxing = false;
        this.fastSpeed = true;
        this.resetSpeed();
      }
      this.renderPiece();
    }
  }

  // Move the falling piece right
  moveRight() {
    if (!availableToMove(this.fallingPiece, 'right')) {
      this.fallingPiece.left++;
      if (touchOtherPiece(this.fallingPiece)) {
        this.fallingPiece.left--;
      }
      if (fixxing && !availableToMove(this.fallingPiece, 'down')) {
        this.fixxing = false;
        this.fastSpeed = true;
        this.resetSpeed();
      }
      this.renderPiece();
    }
  }

  // Increase the falling speed
  fasterSpeed() {
    if (this.fastSpeed || this.fixxing) {
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = setInterval(function () {
      this.moveDown();
    }, 50);
    this.fastSpeed = true;
  }

  // Reset the falling speed
  resetSpeed() {
    if (this.fastSpeed || this.fixxing) {
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = setInterval(function () {
      this.moveDown();
    }, 200);
    this.fastSpeed = false;
  }

  // Make the falling piece fall rapidly
  fallSprint() {
    this.sprint = true;
    if (this.fixxing) {
      clearInterval(this.intervalId);
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = setInterval(function () {
      this.moveDown();
    }, 5);
  }

  checkBorderRotate() {
    const nextDirection = (this.fallingPiece.direction + 1) % 4;
    const center =
      (this.fallingPiece.elements[nextDirection][0] + this.fallingPiece.left) % 10;
    this.fallingPiece.elements[nextDirection].forEach(element => {
      let col = (element + this.fallingPiece.left) % 10;
      const row = Math.floor(element / 10) + this.fallingPiece.top;
      const boardCenter = 5;
      if (center + boardCenter < col) {
        // this.fallingPiece.left++;
        return 'left';
      } else if (center - boardCenter > col) {
        // this.fallingPiece.left--;
        return 'right';
      } else if (row > 19) {
        // this.fallingPiece.top--;
        return 'up';
      }
    });
  }

  // Rotate the falling piece
  rotatePiece() {
    const adjustMove = this.checkBorderRotate();
    let tempPiece = { ...fallingPiece };
    tempPiece.direction = (tempPiece.direction + 1) % 4;
    if (!touchOtherPiece(tempPiece)) {
      if (this.fixxing) {
        this.fixxing = false;
        this.fastSpeed = true;
        this.resetSpeed();
      }
      this.fallingPiece.direction = (this.fallingPiece.direction + 1) % 4;
      this.renderPiece(fallingPiece);
    } else {
      if (adjustMove === 'left') {
        this.fallingPiece.left--;
      } else if (adjustMove === 'right') {
        this.fallingPiece.left++;
      } else if (adjustMove === 'up') {
        this.fallingPiece.top++;
      }
    }
  }

  // Fix the falling piece to the board
  fixPiece() {
    if (this.sprint) {
      clearInterval(this.intervalId);
      this.renderFixedPiece();
    } else {
      this.fixxing = true;
      clearInterval(this.intervalId);
      setTimeout(function () {
        if (this.fixxing) {
          clearInterval(this.intervalId);
          renderFixedPiece();
        }
      }, 1000);
    }
  }

  renderPiece() {
    const { type, left, top, direction, elements } = this.fallingPiece;
    this.boardArray.forEach((element, index) => {
      if (element > falling && element < fixed) {
        boardArray[index] = 0;
      }
    });
    socket.emit('piece', { fallingPiece });
    elements[direction].forEach(element => {
      this.boardArray[element + left + 10 * top] = falling + type;
    });
  }

  renderFixedPiece() {
    const { type, left, top, direction, elements } = this.fallingPiece;
    // const lines = [];
    elements[direction].forEach(element => {
      this.boardArray[element + left + 10 * top] += 10;
      // lines.push(Math.floor((element + left + 10 * top) / 10));
    });
    socket.emit('fixPiece', { fallingPiece });
    // lines.forEach(line => {
    //   clearLine(line);
    // });

    this.newPiece();
  }
}

module.exports = Board;
