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
    this.type++;
  }
}

export default Piece;