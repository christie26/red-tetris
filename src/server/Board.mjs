import FallingPiece from './FallingPiece.mjs';
import SocketPiece from './SocketPiece.mjs';
class Board {
  constructor(socket) {
    this.socket = socket;
    this.width = 10;
    this.height = 20;
    this.fallingStatus = 10;
    this.fixedStatus = 20;
    this.boardArray = new Array(200).fill(0);
    this.fallingPiece = null;
  }
  startGame() {
    let type = Math.floor(Math.random() * 7);
    let left = 3 + Math.floor(Math.random() * 4);
    let direction = Math.floor(Math.random() * 4);

    const fallingPiece = new FallingPiece(type, left, direction);
    fallingPiece.new(this, type, left, direction);
    this.fallingPiece = fallingPiece;
  }
  touchBorder(moveDirection) {
    const { left, top, direction, elements } = this.fallingPiece;
    return elements[direction].some(element => {
      const x = (element + left) % 10;
      const y = Math.floor(element / 10) + top;
       const checks = {
        left: x < 1,
        right: x >= this.width - 1,
        down: y >= this.height - 1,
      };
      return checks[moveDirection];
    });
  }
  touchOtherPiece(tempPiece) {
    const { left, top, direction, elements } = tempPiece;
    return elements[direction].some(element => {
      if (element + left + 10 * top > 199) {
        return true;
      }
      return this.boardArray[element + left + 10 * top] >= this.fixedStatus;
    });
  }
  rotateTouchBorder() {
    const { left, top, direction, elements } = this.fallingPiece;
    const nextDirection = (direction + 1) % 4;
    const center = (elements[nextDirection][0] + left) % 10;
    const boardCenter = 5;

    for (const element of elements[nextDirection]) {
        const col = (element + left) % 10;
        const row = Math.floor(element / 10) + top;

        if (center + boardCenter < col) {
            return 'left';
        } else if (center - boardCenter > col) {
            return 'right';
        } else if (row > 19) {
            return 'up';
        }
    }
    return null;
  }
  fixPiece() {
    if (this.fallingPiece.sprint) {
      clearInterval(this.fallingPiece.intervalId);
      this.renderFixedPiece();
    } else {
      this.fallingPiece.fixxing = true;
      clearInterval(this.fallingPiece.intervalId);
      setTimeout(function () {
        if (this.fallingPiece.fixxing) {
            clearInterval(this.fallingPiece.intervalId);
            this.renderFixedPiece();
        }
    }.bind(this), 1000);
    }
  }
  renderPiece() {
    const sendPiece = new SocketPiece(this.fallingPiece.type, this.fallingPiece.left, this.fallingPiece.top, this.fallingPiece.direction, this.fallingPiece.elements);
    this.socket.emit('piece', { data: sendPiece });
  }

  // ONLY manipulate the boardArray
  renderFixedPiece() {
    console.log('renderFixedPiece');
    const { type, left, top, direction, elements } = this.fallingPiece;
    elements[direction].forEach(element => {
      this.boardArray[element + left + 10 * top] += (type + this.fixedStatus);
    });
    this.logArrayInRows(this.boardArray, 10);

    const sendPiece = new SocketPiece(this.fallingPiece.type, this.fallingPiece.left, this.fallingPiece.top, this.fallingPiece.direction, this.fallingPiece.elements);
    this.socket.emit('fixPiece', { data: sendPiece });

    let newType = Math.floor(Math.random() * 7);
    let newLeft = 3 + Math.floor(Math.random() * 4);
    let newDirection = Math.floor(Math.random() * 4);
    this.fallingPiece.new(this,  newType, newLeft, newDirection);
  }
  logArrayInRows(arr, rowLength) {
    console.log('-------------------')
    for (let i = 0; i < arr.length; i += rowLength) {
        const row = arr.slice(i, i + rowLength);
        console.log(row.map(number => number.toString().padStart(2, ' ')).join(', '));
    }
  }
  pauseGame() {
    clearInterval(this.intervalId);
  }
  restartGame() {
    this.intervalId = setInterval(() => this.moveDown(), 200);
  }
}

export default Board;
