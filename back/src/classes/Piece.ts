import Pieces from "../Pieces.js";
import Tile from "./Tile.js";

class Piece {
  type: number;
  tiles: Tile[];

  constructor(type: number, left: number, direction: number) {
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

//   checkFloating(): void {
//     const dropTiles = this.board.dropLocation();
//     if (!this.areTilesEqual(this.tiles, dropTiles)) {
//       this.tiles = dropTiles;
//     }
//   }

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
