import Pieces from '../Pieces.mjs';
import Tile from './Tile.mjs';
class Piece {
  constructor(board, type, left, direction) {
    this.board = board;
    this.type = type;
    this.sprint = false;
    this.fixxing = false;
    this.fastSpeed = false;
    this.lock = false;
    this.intervalId = null;
    this.tiles = [];
    for (let i = 0; i < 4; i++) {
      const index = Pieces[type][direction][i]
      this.addTile(index % 10 + left, Math.floor(index / 10), i === 0);
    }
    this.board.fallingPiece = this;
    if (this.board.touchOtherPiece(this.tiles)) {
      this.board.gameover = true;
      return;
    }
    this.board.renderPiece();
    this.intervalId = setInterval(() => this.moveDown(), 5000);
  }
  /* manage tiles */
  addTile(x, y) {
    this.tiles.push(new Tile(x, y, this.type + 1));
  }
  dupTiles(tiles) {
    let tempTiles = tiles.map(tile =>
      new Tile(tile.x, tile.y, tile.type)
    );
    return tempTiles
  }
  moveTiles(tiles, direction) {
    tiles.forEach(tile => {
      if (direction === 'left') {
        tile.x--;
      } else if (direction === 'right') {
        tile.x++;
      } else if (direction === 'down') {
        tile.y++;
      }
    });
  }
  rotateTiles(tiles) {
    if (tiles[0].type == 0)
      return;
    const center = tiles[0];
    for (let index = 1; index < tiles.length; index++) {
      let tile = tiles[index];
      const tmp_x = tile.x
      const tmp_y = tile.y
      tile.x = center.x + center.y - tmp_y;
      tile.y = center.y - center.x + tmp_x;
    }
  }
  /* manage a piece */
  moveSide(direction) {
    if (this.lock)
      return
    let tempTiles = this.dupTiles(this.tiles)
    this.moveTiles(tempTiles, direction);
    if (this.board.isFree(tempTiles)) {
      this.moveTiles(this.tiles, direction);
      this.board.renderPiece();
      this.moveTiles(tempTiles, 'down')
      if (this.fixxing && this.board.isFree(tempTiles)) {
        this.fixxing = false;
        this.fastSpeed = true;
        this.resetSpeed();
      }
    }
  }
  moveDown() {
    let tempTiles = this.dupTiles(this.tiles)
    this.moveTiles(tempTiles, 'down')
    if (this.board.isFree(tempTiles)) {
      this.moveTiles(this.tiles, 'down');
      this.board.renderPiece();
    } else {
      this.fixPiece();
    }
  }
  rotatePiece() {
    if (this.tiles[0].type === 7 || this.lock) return;

    let tempTiles = this.dupTiles(this.tiles);
    this.rotateTiles(tempTiles);

    if (!this.board.isFree(tempTiles)) {
      const directions = ['left', 'right', 'up'];
      const successfulMove = this.tryMoveInDirections(tempTiles, directions);
      if (!successfulMove) return;
    }

    this.rotateTiles(this.tiles);
    this.board.renderPiece();
    this.moveTiles(tempTiles, 'down')
    if (this.fixxing && this.board.isFree(tempTiles)) {
      this.fixxing = false;
      this.fastSpeed = true;
      this.resetSpeed();
    } else {
    }
  }
  tryMoveInDirections(tempTiles, directions) {
    for (const direction of directions) {
      let doubleTemp = this.dupTiles(tempTiles)
      this.moveTiles(doubleTemp, direction);
      if (this.board.isFree(doubleTemp)) {
        this.moveTiles(this.tiles, direction);
        return true;
      }
    }
    return false;
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
        else {
          this.lock = true
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
    if (!this.fastSpeed || this.fixxing) {
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.moveDown();
    }, 500);
    this.fastSpeed = false;
  }
  stopPiece() {
    clearInterval(this.intervalId);
  }
  checkFloating() {
    if (this.board.dropLocation != this.tiles) {
      this.tiles = this.board.dropLocation()
    }
  }
}

export default Piece;
