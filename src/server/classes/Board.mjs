import Piece from './Piece.mjs';
import seedrandom from 'seedrandom';
/*
Board class represents each board.
It only last for one game.
*/
class Board {
  constructor(socket, key, Player) {
    this.socket = socket;
    this.width = 10;
    this.height = 20;
    this.fallingStatus = 10;
    this.fixedStatus = 20;
    this.fallingPiece = null;
    this.piecesArray = [];
    this.createRandom = seedrandom(key);
    this.gameover = false;
    this.Player = Player;
  }
  newPiece() {
    let type = Math.floor(this.createRandom() * 7);
    let left = 3 + Math.floor(this.createRandom() * 4);
    let direction = Math.floor(this.createRandom() * 4);
    this.fallingPiece = new Piece(this, type, left, direction);
    if (this.gameover == true) {
      this.socket.emit('fallingPiece', { data: this.fallingPiece.tilesArray });
      this.Player.Room.onePlayerGameover();
    }
  }
  /*check board*/
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
  /*render piece*/
  renderPiece() {
    this.socket.emit('fallingPiece', { data: this.fallingPiece.tilesArray });
  }
  renderFixedPiece() {
    this.socket.emit('fixPiece', { data: this.fallingPiece.tilesArray });

    this.piecesArray.push(this.fallingPiece.tilesArray);
    this.fallingPiece = null;
    this.newPiece()
  }
}

export default Board;
