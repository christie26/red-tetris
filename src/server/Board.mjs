import FallingPiece from './FallingPiece.mjs';
class Board {
  constructor(socket) {
    this.socket = socket;
    this.boardWidth = 10;
    this.boardHeight = 20;
    this.fallingStatus = 10;
    this.fixedStatus = 20;
    this.intervalId = null;

    this.boardArray = new Array(200).fill(0);
    clearInterval(this.intervalId);
  }
  newPiece() {
    // TODO: logic to create random value
    const type = Math.floor(Math.random() * 7);
    const left = 3 + Math.floor(Math.random() * 4);
    const direction = Math.floor(Math.random() * 4);
    this.fallingPiece = new FallingPiece(type, left, direction);
    if (this.touchOtherPiece(this.fallingPiece)) {
      this.socket.emit('piece', { fallingPiece: this.fallingPiece });
      alert('Game Over');
      return;
    }
    this.renderPiece();
    this.intervalId = setInterval(() => this.moveDown(), 2000);
  }
  moveDown() {
    if (this.fallingPiece.top <= this.boardHeight) {
      this.fallingPiece.moveDown();
      if (this.touchOtherPiece(this.fallingPiece)) {
        this.fallingPiece.moveUp();
        this.fixPiece();
      } else {
        this.renderPiece();
        if (this.touchBorder('down')) {
          this.fixPiece();
        }
      }
      return;
    }
  }
  // Check if the falling piece can move in the specified direction
  touchBorder(moveDirection) {
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
    if (!this.touchBorder('left')) {
      this.fallingPiece.moveLeft();
      if (this.touchOtherPiece(this.fallingPiece)) {
        this.fallingPiece.moveRight();
      }
      if (this.fallingPiece.fixxing && !this.touchBorder(this.fallingPiece, 'down')) {
        this.fallingPiece.fixxing = false;
        this.fallingPiece.fastSpeed = true;
        this.resetSpeed();
      }
      this.renderPiece();
    }
  }
  // Move the falling piece right
  moveRight() {
    if (!this.touchBorder('right')) {
        this.fallingPiece.moveRight();
      if (this.touchOtherPiece(this.fallingPiece)) {
        this.fallingPiece.moveLeft();
      }
      if (this.fixxing && !this.touchBorder(this.fallingPiece, 'down')) {
        this.fallingPiece.fixxing = false;
        this.fallingPiece.fastSpeed = true;
        this.resetSpeed();
      }
      this.renderPiece();
    }
  }
  // Increase the speed
  fasterSpeed() {
    if (this.fallingPiece.fastSpeed || this.fallingPiece.fixxing) {
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = setInterval(function () {
      this.moveDown();
    }, 50);
    this.fallingPiece.fastSpeed = true;
  }
  // Reset the speed
  resetSpeed() {
    if (this.fallingPiece.fastSpeed || this.fallingPiece.fixxing) {
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() =>{
      this.moveDown();
    }, 200);
    this.fallingPiece.fastSpeed = false;
  }
  // Space key pressed
  fallSprint() {
    this.fallingPiece.sprint = true;
    if (this.fallingPiece.fixxing) {
      clearInterval(this.intervalId);
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
        this.moveDown();
    }, 5);
  }
  // Check if the falling piece touch border when rotate
  rotateTouchBorder() {
    const nextDirection = (this.fallingPiece.direction + 1) % 4;
    const center =
      (this.fallingPiece.elements[nextDirection][0] + this.fallingPiece.left) % 10;
    this.fallingPiece.elements[nextDirection].forEach(element => {
      let col = (element + this.fallingPiece.left) % 10;
      const row = Math.floor(element / 10) + this.fallingPiece.top;
      const boardCenter = 5;
      if (center + boardCenter < col) {
        return 'left';
      } else if (center - boardCenter > col) {
        console.log('right');
        return 'right';
      } else if (row > 19) {
        return 'up';
      }
    });
  }
  // Rotate the falling piece
  rotatePiece() {
    const adjustMove = this.rotateTouchBorder();
    let tempPiece = { ...this.fallingPiece };
    tempPiece.direction = (tempPiece.direction + 1) % 4;
    if (!this.touchOtherPiece(tempPiece)) {
      if (this.fallingPiece.fixxing) {
        this.fallingPiece.fixxing = false;
        this.fallingPiece.fastSpeed = true;
        this.resetSpeed();
      }
      this.fallingPiece.direction = (this.fallingPiece.direction + 1) % 4;
      this.renderPiece(this.fallingPiece);
    } else {
      if (adjustMove === 'left') {
        this.fallingPiece.moveRight();
      } else if (adjustMove === 'right') {
        this.fallingPiece.moveLeft();
      } else if (adjustMove === 'up') {
        this.fallingPiece.moveUp();
      }
    }
  }
  // Fix the falling piece to the board
  fixPiece() {
    if (this.fallingPiece.sprint) {
        clearInterval(this.intervalId);
        this.renderFixedPiece();
    } else {
        this.fallingPiece.fixxing = true;
        clearInterval(this.intervalId);
        setTimeout(function () {
          if (this.fallingPiece.fixxing) {
              clearInterval(this.intervalId);
              this.renderFixedPiece();
          }
      }.bind(this), 1000);
    }
  }
  renderPiece() {
    const { type, left, top, direction, elements } = this.fallingPiece;
    this.boardArray.forEach((element, index) => {
      if (element > this.fallingStatus && element < this.fixedStatus) {
        this.boardArray[index] = 0;
      }
    });
    this.socket.emit('piece', { data: this.fallingPiece });
    elements[direction].forEach(element => {
      this.boardArray[element + left + 10 * top] = this.fallingStatus + type;
    });
  }
  renderFixedPiece() {
    const { type, left, top, direction, elements } = this.fallingPiece;
    // const lines = [];
    elements[direction].forEach(element => {
      this.boardArray[element + left + 10 * top] += 10;
      // lines.push(Math.floor((element + left + 10 * top) / 10));
    });
    this.socket.emit('fixPiece', { data: this.fallingPiece });
    // lines.forEach(line => {
    //   clearLine(line);
    // });

    this.newPiece();
  }
}

export default Board;
