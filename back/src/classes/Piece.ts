import Pieces from "../Pieces.js";
import Tile from "./Tile.js";
import Board from "./Board.js";

class Piece {
  board: Board;
  type: number;
  sprint: boolean;
  fixxing: boolean;
  fastSpeed: boolean;
  lock: boolean;
  intervalId: NodeJS.Timeout | null;
  tiles: Tile[];

  constructor(board: Board, type: number, left: number, direction: number) {
    this.board = board;
    this.type = type;
    this.sprint = false;
    this.fixxing = false;
    this.fastSpeed = false;
    this.lock = false;
    this.intervalId = null;
    this.tiles = [];

    for (let i = 0; i < 4; i++) {
      const index = Pieces[type][direction][i];
      this.addTile((index % 10) + left, Math.floor(index / 10));
    }

    this.board.fallingPiece = this;
    if (this.board.touchOtherPiece(this.tiles)) {
      this.board.gameover = true;
      return;
    }

    this.board.renderPiece();
    this.intervalId = setInterval(() => this.moveDown(), 500);
  }

  /* manage tiles */
  addTile(x: number, y: number): void {
    this.tiles.push(new Tile(x, y, this.type + 1));
  }

  dupTiles(tiles: Tile[]): Tile[] {
    return tiles.map((tile) => new Tile(tile.x, tile.y, tile.type));
  }

  moveTiles(tiles: Tile[], direction: "left" | "right" | "down" | "up"): void {
    tiles.forEach((tile) => {
      if (direction === "left") {
        tile.x--;
      } else if (direction === "right") {
        tile.x++;
      } else if (direction === "down") {
        tile.y++;
      }
    });
  }

  rotateTiles(tiles: Tile[]): void {
    if (tiles[0].type === 0) return;

    const center = tiles[0];
    for (let index = 1; index < tiles.length; index++) {
      const tile = tiles[index];
      const tmp_x = tile.x;
      const tmp_y = tile.y;
      tile.x = center.x + center.y - tmp_y;
      tile.y = center.y - center.x + tmp_x;
    }
  }

  /* manage a piece */
  moveSide(direction: "left" | "right"): void {
    if (this.lock) return;

    let tempTiles = this.dupTiles(this.tiles);
    this.moveTiles(tempTiles, direction);

    if (this.board.isFree(tempTiles)) {
      this.moveTiles(this.tiles, direction);
      this.board.renderPiece();
      this.moveTiles(tempTiles, "down");

      if (this.fixxing && this.board.isFree(tempTiles)) {
        this.fixxing = false;
        this.fastSpeed = true;
        this.resetSpeed();
      }
    }
  }

  moveDown(): void {
    let tempTiles = this.dupTiles(this.tiles);
    this.moveTiles(tempTiles, "down");

    if (this.board.isFree(tempTiles)) {
      this.moveTiles(this.tiles, "down");
      this.board.renderPiece();
      this.board.getPenalty();
    } else {
      this.fixPiece();
    }
  }

  rotatePiece(): void {
    if (this.tiles[0].type === 7 || this.lock) return;

    let tempTiles = this.dupTiles(this.tiles);
    this.rotateTiles(tempTiles);

    if (!this.board.isFree(tempTiles)) {
      const directions = ["left", "right", "down", "up"] as const;
      const successfulMove = this.tryMoveInDirections(tempTiles, directions);
      if (!successfulMove) return;
    }

    this.rotateTiles(this.tiles);
    this.board.renderPiece();
    this.moveTiles(tempTiles, "down");

    if (this.fixxing && this.board.isFree(tempTiles)) {
      this.fixxing = false;
      this.fastSpeed = true;
      this.resetSpeed();
    }
  }

  tryMoveInDirections(
    tempTiles: Tile[],
    directions: readonly ("left" | "right" | "down" | "up")[],
  ): boolean {
    for (const direction of directions) {
      let doubleTemp = this.dupTiles(tempTiles);
      this.moveTiles(doubleTemp, direction);

      if (this.board.isFree(doubleTemp)) {
        this.moveTiles(this.tiles, direction);
        return true;
      }
    }
    return false;
  }

  fixPiece(): void {
    if (this.sprint) {
      clearInterval(this.intervalId!);
      this.board.renderFixedPiece();
    } else {
      this.fixxing = true;
      clearInterval(this.intervalId!);

      setTimeout(() => {
        if (this.fixxing) {
          this.board.renderFixedPiece();
        } else {
          this.lock = true;
        }
      }, 1000);
    }
  }

  /* manage a speed */
  fallSprint(): void {
    this.sprint = true;

    if (this.fixxing) {
      clearInterval(this.intervalId!);
      return;
    }

    clearInterval(this.intervalId!);
    this.intervalId = setInterval(() => {
      this.moveDown();
    }, 5);
  }

  fasterSpeed(): void {
    if (this.fastSpeed || this.fixxing) return;

    clearInterval(this.intervalId!);
    this.intervalId = setInterval(() => {
      this.moveDown();
    }, 50);
    this.fastSpeed = true;
  }

  resetSpeed(): void {
    if (!this.fastSpeed || this.fixxing) return;

    clearInterval(this.intervalId!);
    this.intervalId = setInterval(() => {
      this.moveDown();
    }, 500);
    this.fastSpeed = false;
  }

  stopPiece(): void {
    clearInterval(this.intervalId!);
  }

  checkFloating(): void {
    const dropTiles = this.board.dropLocation();
    if (!this.areTilesEqual(this.tiles, dropTiles)) {
      this.tiles = dropTiles;
    }
  }

  private areTilesEqual(
    tiles1: Tile[],
    tiles2: { x: number; y: number; type: number }[],
  ): boolean {
    if (tiles1.length !== tiles2.length) {
      return false;
    }

    return tiles1.every((tile, index) => {
      const dropTile = tiles2[index];
      return (
        tile.x === dropTile.x &&
        tile.y === dropTile.y &&
        tile.type === dropTile.type
      );
    });
  }
}

export default Piece;
