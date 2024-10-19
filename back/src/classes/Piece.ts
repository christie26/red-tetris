import Pieces from "../Pieces.js";
import Tile from "./Tile.js";
import Board from "./Board.js";

class Piece {
  board: Board;
  type: number;
  tiles: Tile[];

  constructor(board: Board, type: number, left: number, direction: number) {
    this.board = board;
    this.type = type;
    this.tiles = [];

    for (let i = 0; i < 4; i++) {
      const index = Pieces[type][direction][i];
      this.tiles.push(
        new Tile((index % 10) + left, Math.floor(index / 10), this.type + 1),
      );
    }
  }

  /* move a piece */
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
  moveSide(direction: "left" | "right"): void {
    let tempTiles = this.board.dupTiles(this.tiles);
    this.moveTiles(tempTiles, direction);

    if (this.board.isFree(tempTiles)) {
      this.moveTiles(this.tiles, direction);
      this.board.renderPiece();
      this.moveTiles(tempTiles, "down");
    }
  }

  /* rotate a piece */
  rotatePiece(): void {
    if (this.tiles[0].type === 7) return;

    let tempTiles = this.board.dupTiles(this.tiles);
    this.rotateTiles(tempTiles);

    if (!this.board.isFree(tempTiles)) {
      const directions = ["left", "right", "down", "up"] as const;
      const successfulMove = this.tryMoveInDirections(tempTiles, directions);
      if (!successfulMove) return;
    }

    this.rotateTiles(this.tiles);
    this.board.renderPiece();
    this.moveTiles(tempTiles, "down");
  }
  tryMoveInDirections(
    tempTiles: Tile[],
    directions: readonly ("left" | "right" | "down" | "up")[],
  ): boolean {
    for (const direction of directions) {
      let doubleTemp = this.board.dupTiles(tempTiles);
      this.moveTiles(doubleTemp, direction);

      if (this.board.isFree(doubleTemp)) {
        this.moveTiles(this.tiles, direction);
        return true;
      }
    }
    return false;
  }

  checkFloating(): void {
    const dropTiles = this.board.dropLocation();
    if (!this.areTilesEqual(this.tiles, dropTiles)) {
      this.tiles = dropTiles;
    }
  }

  /* utilities */
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
