import Pieces from './Pieces.mjs';
import Board from './Board.mjs';

class FallingPiece {
  constructor(type, left, direction) {
    this.type = type;
    this.left = left;
    this.top = 0;
    this.direction = direction;
    this.elements = Pieces[type];
    this.sprint = false;
    this.fixxing = false;
    this.fastSpeed = false;
    this.intervalId = null;
  }

  new(Board, type, left, direction) {
    this.board = Board;
    this.board.fallingPiece = new FallingPiece(type, left, direction);
    if (this.board.touchOtherPiece(this)) {
      this.board.socket.emit('piece', { fallingPiece: this.board.fallingPiece });
      this.board.socket.emit('gameOver', { gameOver: true });
      return;
    }
    this.board.renderPiece();
    this.intervalId = setInterval(() => this.moveDown(), 200);
  }

  moveDown() {
    if (this.top <= this.board.height) {
      let tempPiece = {... this};
      tempPiece.top = this.top + 1;
      if (this.board.touchOtherPiece(tempPiece)) {
        this.board.fixPiece();
      } else {
        this.top++;
        this.board.renderPiece();
        if (this.board.touchBorder('down')) {
          this.board.fixPiece();
        }
      }
      return;
    }
  }
  moveLeft() {
    console.log('moveLeft');
    if (!this.board.touchBorder('left')) {
      let tempPiece = {... this};
      tempPiece.left = this.left - 1;
      if (!this.board.touchOtherPiece(tempPiece)) {
        this.left--;
        if (this.fixxing && !this.touchBorder(this, 'down')) {
          this.fixxing = false;
          this.fastSpeed = true;
          this.resetSpeed();
        }
      }
      this.board.renderPiece();
    }
  }
  moveRight() {
    if (!this.board.touchBorder('right')) {
      let tempPiece = {... this};
      tempPiece.left = this.left + 1;
      if (!this.board.touchOtherPiece(tempPiece)) {
        this.left++;
        if (this.fixxing && !this.touchBorder(this, 'down')) {
          this.fixxing = false;
          this.fastSpeed = true;
          this.resetSpeed();
        }
      }
      this.board.renderPiece();
    }
  }
  rotatePiece() {
    const adjustMove = this.board.rotateTouchBorder();
    if (adjustMove === 'left') {
      this.moveRight();
    } else if (adjustMove === 'right') {
      this.moveLeft();
    } else if (adjustMove === 'up') {
      this.moveUp();
    }
    let tempPiece = {... this};
    tempPiece.direction = (this.direction + 1) % 4;
    if (!this.board.touchOtherPiece(tempPiece)) {
      if (this.fixxing) {
        this.fixxing = false;
        this.fastSpeed = true;
        this.resetSpeed();
      }
      this.direction = (this.direction + 1) % 4;
      this.board.renderPiece();
    }
  }

// manage speed
  fasterSpeed() {
    if (this.fastSpeed || this.fixxing) {
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.moveDown();
    }, 50);
    this.fastSpeed = true;
  }
  resetSpeed() {
    if (this.fastSpeed || this.fixxing) {
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() =>{
      this.moveDown();
    }, 200);
    this.fastSpeed = false;
  }
  fallSprint() {
    this.sprint = true;
    if (this.fixxing) {
      clearInterval(this.intervalId);
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
        this.moveDown();
    }, 5);
  }
}

export default FallingPiece;
