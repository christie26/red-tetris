import Pieces from '../Pieces.mjs';
import Tile from './Tile.mjs';
import Board from './Board.mjs'
class Piece {
  constructor(board, type, left, direction) {
    this.board = board;
    this.type = type;
    this.elements = Pieces[type];
    this.sprint = false;
    this.fixxing = false;
    this.fastSpeed = false;
    this.intervalId = null;
    this.tilesArray = [];
    for (let i = 0; i < 4; i++) {
      const index = this.elements[direction][i]
      this.addTile(index % 10 + left, 19 - Math.floor(index / 10), i === 0);
    }
    this.board.fallingPiece = this;
    if (this.board.touchOtherPiece(this.tilesArray)) {
      this.board.gameover = true;
      return;
    }
    this.board.renderPiece();
    this.intervalId = setInterval(() => this.moveDown(), 500);
  }
  /* manage tiles */
  addTile(x, y) {
    this.tilesArray.push(new Tile(x, y, this.type));
  }
  removeTile(tile) {
    //call it when we empty the line
    this.tilesArray = this.tilesArray.filter(t => t !== tile);
  }
  moveTiles(direction) {
    this.tilesArray.forEach(tile => {
      if (direction === 'left') {
        tile.x--;
      } else if (direction === 'right') {
        tile.x++;
      } else if (direction === 'down') {
        tile.y--;
      }
    });
  }
  rotateTiles(tilesArray) {
    //oBlock
    if (tilesArray[0].type == 0)
      return;
    const center = tilesArray[0];
    for (let index = 1; index < tilesArray.length; index++) {
      let tile = tilesArray[index];
      const tmp_x = tile.x
      const tmp_y = tile.y
      tile.x = center.x - center.y + tmp_y;
      tile.y = center.y + center.x - tmp_x;
    }
  }
  /* manage a piece */
  moveLeft() {
    let tempTiles = this.tilesArray.map(tile =>
      new Tile(tile.x, tile.y, tile.type, tile.center)
    );
    for (const tile of tempTiles) {
      tile.x--;
    }
    if (!this.board.touchOtherPiece(tempTiles) && !this.board.touchBorder(tempTiles)) {
      this.moveTiles('left');
      this.board.renderPiece();
      for (const tile of tempTiles) {
        tile.y--;
      }
      if (this.fixxing && !this.board.touchBorder(tempTiles)) {
        this.fixxing = false;
        this.fastSpeed = true;
        this.resetSpeed();
      }
    }
  }
  moveRight() {
    let tempTiles = this.tilesArray.map(tile =>
      new Tile(tile.x, tile.y, tile.type, tile.center)
    );
    for (const tile of tempTiles) {
      tile.x++;
    }
    if (!this.board.touchOtherPiece(tempTiles) && !this.board.touchBorder(tempTiles)) {
      this.moveTiles('right');
      this.board.renderPiece();
      for (const tile of tempTiles) {
        tile.y--;
      }
      if (this.fixxing && !this.board.touchBorder(tempTiles)) {
        this.fixxing = false;
        this.fastSpeed = true;
        this.resetSpeed();
      }
    }
  }
  moveDown() {
    let tempTiles = this.tilesArray.map(tile =>
      new Tile(tile.x, tile.y, tile.type, tile.center)
    );
    for (const tile of tempTiles) {
      tile.y--;
    }
    if (!this.board.touchOtherPiece(tempTiles) && !this.board.touchBorder(tempTiles)) {
      this.moveTiles('down');
      this.board.renderPiece();
    } else {
      this.fixPiece();
    }
  }
  rotatePiece() {
    // TODO : implement adust moving of piece
    // const adjustMove = this.board.rotateTouchBorder();
    // if (adjustMove === 'left') {
    //   this.moveRight();
    // } else if (adjustMove === 'right') {
    //   this.moveLeft();
    // } else if (adjustMove === 'up') {
    //   this.moveUp();
    // }
    if (this.tilesArray[0].type === 0)
      return;
    let tempTiles = this.tilesArray.map(tile =>
      new Tile(tile.x, tile.y, tile.type, tile.center)
    );
    this.rotateTiles(tempTiles)
    if (!this.board.touchOtherPiece(tempTiles) && !this.board.touchBorder(tempTiles)) {
      this.rotateTiles(this.tilesArray)
      this.board.renderPiece();
    }
  }
  fixPiece() {
    if (this.sprint) {
      clearInterval(this.intervalId);
      this.board.renderFixedPiece();
    } else {
      this.fixxing = true;
      clearInterval(this.intervalId);
      setTimeout(function () {
        if (this.fixxing) {
          this.board.renderFixedPiece();
        }
      }.bind(this), 1000);
    }
  }
  /* manage a speed */
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
    this.intervalId = setInterval(() => {
      this.moveDown();
    }, 200);
    this.fastSpeed = false;
  }
}

export default Piece;
