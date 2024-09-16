import Piece from './Piece.mjs';
/*
Board class represent each board.
*/
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
  startGame() {
    //TODO: wait for start
    this.newPiece();
  }
  newPiece() {
    // TODO: change random generate logic
    let type = 1;
    // let type = Math.floor(Math.random() * 7);
    let left = 3 + Math.floor(Math.random() * 4);
    let direction = Math.floor(Math.random() * 4);
    this.fallingPiece = new Piece(this, type, left, direction);
  }

  touchBorder(tempTiles) {
    for (const tile of tempTiles) {
      if (tile.x < 0 || tile.x >= this.width || tile.y >= this.height || tile.y < 0) {
        return true;
      }
    }
    return false;
  }
  touchOtherPiece(tempTiles) {
    for (const tile of tempTiles) {
      for (const piece of this.piecesArray) {
        for (const pieceTile of piece) {
          if (tile.x === pieceTile.x && tile.y === pieceTile.y) {
            return true;
          }
        }
      }
    }
    return false;
  }

  renderPiece() {
    this.socket.emit('fallingPiece', { data: this.fallingPiece.tilesArray });
  }
  renderFixedPiece() {
    this.socket.emit('fixPiece', { data: this.fallingPiece.tilesArray });

    this.piecesArray.push(this.fallingPiece.tilesArray);
    this.fallingPiece = null;
    this.newPiece()
  }

  pauseGame() {
    clearInterval(this.intervalId);
  }
  restartGame() {
    this.intervalId = setInterval(() => this.moveDown(), 200);
  }
}

export default Board;
