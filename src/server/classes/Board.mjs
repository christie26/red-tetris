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
    this.fixedTiles = Array.from({ length: 20 }, () => new Array(10).fill(0));
    this.createRandom = seedrandom(key);
    this.gameover = false;
    this.Player = Player;
  }
  newPiece() {
    if (this.gameover)
      return;
    let type = Math.floor(this.createRandom() * 7);
    let left = 3 + Math.floor(this.createRandom() * 4);
    let direction = Math.floor(this.createRandom() * 4);
    this.fallingPiece = new Piece(this, type, left, direction);
    if (this.gameover) {
      for (const tile of this.fallingPiece.tiles)
        this.fixedTiles[tile.y][tile.x] = tile.type
      this.Player.gameover();
    }
  }
  /*check board*/
  isFree(tiles) {
    return (!this.touchBorder(tiles) && !this.touchOtherPiece(tiles))
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
      if (this.fixedTiles[tile.y][tile.x]) {
        return true;
      }
    }
    return false;
  }
  /*render piece*/
  renderPiece() {
    let board = this.fixedTiles.map(row => [...row]);

    for (const tile of this.fallingPiece.tiles) {
      board[tile.y][tile.x] = tile.type
    }
    this.Player.Room.updateBoard(this.Player.playername, board, 'falling')
  }
  renderFixedPiece() {
    for (const tile of this.fallingPiece.tiles) {
      this.fixedTiles[tile.y][tile.x] = tile.type + 10;
    }
    this.Player.Room.updateBoard(this.Player.playername, this.fixedTiles, 'fixed')
    this.clearLines();
    this.fallingPiece = null;
    this.newPiece()
  }
  isLineFull(y) {
    for (let x = 0; x < 10; x++) {
      if (!this.fixedTiles[y][x]) {
        return false;
      }
    }
    return true;
  }
  clearLines() {
    let lineNumber = 0;
    for (const tile of this.fallingPiece.tiles) {
      const y = tile.y;
      if (this.isLineFull(y)) {
        for (let row = y; row > 0; row--) {
          for (let x = 0; x < this.width; x++) {
            this.fixedTiles[row][x] = this.fixedTiles[row - 1][x];
          }
        }
        for (let x = 0; x < this.width; x++) {
          this.fixedTiles[0][x] = 0;
        }
        lineNumber++;
      }
    }
    this.Player.Room.updateBoard(this.Player.playername, this.fixedTiles)
    if (lineNumber > 1) {
      this.Player.Room.sendPenalty(this.Player.playername, lineNumber - 1)
    }
  }
  getPenalty(numberOfLine) {
    for (let offset = 0; offset < numberOfLine; offset++) {
      if (this.fixedTiles[19 - offset].some(element => element > 0))
        this.gameover = true;
    }

    for (let row = 19 - numberOfLine; row >= 0; row--) {
      this.fixedTiles[row] = [...this.fixedTiles[row + numberOfLine]];
    }
    for (let row = 19; row >= 19 - numberOfLine; row--) {
      this.fixedTiles[row].forEach((_, colIndex) => {
        this.fixedTiles[row][colIndex] = 20;
      });
    }
    if (this.gameover)
      this.Player.gameover()
  }
  printBoard(board) {
    for (let row = 0; row <= 19; row++) {
      let rowString = '';
      for (let col = 0; col < this.width; col++) {
        rowString += board[row][col] > 0 ? 'x' : '.';
      }
      console.log(rowString);
    }
    console.log('----')
  }
  freezeBoard() {
    this.fallingPiece.stopPiece();
  }
  dropLocation() {
    let tiles = this.fallingPiece.dupTiles(this.fallingPiece.tiles)
    let testTiles = this.fallingPiece.dupTiles(this.fallingPiece.tiles)

    this.fallingPiece.moveTiles(testTiles, 'down')
    while (this.isFree(testTiles)) {
      tiles = testTiles
      this.fallingPiece.moveTiles(testTiles, 'down')
    }
    console.log(tiles)
    return tiles
  }
}

export default Board;
