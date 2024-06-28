import Piece from './Piece.mjs';
class Board {
  constructor(socket) {
    this.socket = socket;
    this.width = 10;
    this.height = 20;
    this.fallingStatus = 10;
    this.fixedStatus = 20;
    this.fallingPiece = null;
    this.piecesArray = [];
  }
/* start game */
  startGame() {
    // TODO: change random generate logic
    let type = Math.floor(Math.random() * 7);
    let left = 3 + Math.floor(Math.random() * 4);
    let direction = Math.floor(Math.random() * 4);
    this.fallingPiece = new Piece(this, type, left, direction);
  }
/* tile valid check */
  touchBorder(tempTiles) {
    for (const tile of tempTiles) {
      if (tile.x < 0 || tile.x >= this.width || tile.y >= this.height) {
        return true;
      }
    }
  }
  touchOtherPiece(tempTiles) {
    for (const tile of tempTiles) {
      for (const piece of this.piecesArray) {
        for (const pieceTile of piece.tilesArray) {
          if (tile.x === pieceTile.x && tile.y === pieceTile.y) {
            return true;
          }
        }
      }
    }
  }

/* render piece */
  renderPiece() {
    console.log('in renderPiece', this.fallingPiece.tilesArray);
    this.socket.emit('piece', { data: this.fallingPiece.tilesArray });
    // console.log('renderPiece');
  }
  renderFixedPiece() {
    console.log('in renderFixedPiece', this.fallingPiece.tilesArray)
    this.socket.emit('fixPiece', { data: this.fallingPiece.tilesArray });

    this.piecesArray.push(this.fallingPiece);
    this.fallingPiece = null;

    let newType = Math.floor(Math.random() * 7);
    let newLeft = 3 + Math.floor(Math.random() * 4);
    let newDirection = Math.floor(Math.random() * 4);
    this.fallingPiece = new Piece(this, newType, newLeft, newDirection);
  }

/* pause,restart game */
  pauseGame() {
    clearInterval(this.intervalId);
  }
  restartGame() {
    this.intervalId = setInterval(() => this.moveDown(), 200);
  }
}

export default Board;
