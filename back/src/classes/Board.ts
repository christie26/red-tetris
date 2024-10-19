import Piece from "./Piece.js";
import seedrandom from "seedrandom";
import Player from "./Player.js";

class Board {
  socket: any; // Specify the correct type for socket, if known
  width: number;
  height: number;
  public fallingStatus: number;
  fixedStatus: number;
  fallingPiece: Piece | null;
  fixedTiles: number[][];
  createRandom: () => number;
  gameover: boolean;
  Player: Player;
  penaltyLine: number;
  unpaidPenalties: number;

  constructor(socket: any, key: string, Player: Player) {
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
    this.penaltyLine = 0;
    this.unpaidPenalties = 0;
  }

  newPiece(): void {
    if (this.gameover) return;

    // let type: number = Math.floor(this.createRandom() * 7);
    let type: number = 6;
    let left: number = 3 + Math.floor(this.createRandom() * 4);
    let direction: number = Math.floor(this.createRandom() * 4);

    this.fallingPiece = new Piece(this, type, left, direction);
    if (this.gameover) {
      for (const tile of this.fallingPiece.tiles) {
        this.fixedTiles[tile.y][tile.x] = tile.type;
      }
      this.Player.gameover();
    }
  }

  /* check board */
  isFree(tiles: { x: number; y: number; type: number }[]): boolean {
    return !this.touchBorder(tiles) && !this.touchOtherPiece(tiles);
  }

  touchBorder(tempTiles: { x: number; y: number; type: number }[]): boolean {
    for (const tile of tempTiles) {
      if (
        tile.x < 0 ||
        tile.x >= this.width ||
        tile.y >= this.height ||
        tile.y < 0
      ) {
        return true;
      }
    }
    return false;
  }

  touchOtherPiece(
    tempTiles: { x: number; y: number; type: number }[],
  ): boolean {
    for (const tile of tempTiles) {
      if (this.fixedTiles[tile.y][tile.x]) {
        return true;
      }
    }
    return false;
  }

  /* render piece */
  renderPiece(): void {
    let board = this.fixedTiles.map((row) => [...row]);
    if (this.fallingPiece) {
      for (const tile of this.fallingPiece.tiles) {
        board[tile.y][tile.x] = tile.type;
      }
    }
    this.Player.Room.updateBoard(this.Player.playername, board, "falling");
  }

  renderFixedPiece(): void {
    console.log("from render1", this.Player.playername);
    this.printBoard(this.fixedTiles);
    let moveUp = 0;
    if (this.fallingPiece) {
      for (let i = 0; i < this.penaltyLine; i++) {
        for (const tile of this.fallingPiece.tiles) {
          if (tile.y === 19 - i) {
            moveUp++;
            break;
          }
        }
      }
      if (moveUp) console.log("moveup", moveUp);
      for (const tile of this.fallingPiece.tiles) {
        const newY = tile.y - moveUp;
        if (moveUp) console.log("tile", tile.x, tile.y, newY);
        if (newY >= 0) {
          this.fixedTiles[newY][tile.x] = tile.type + 10;
        } else {
          console.log("oops gameover");
          this.Player.gameover();
          return;
        }
      }
    }
    this.clearLines();
    console.log("from render2", this.Player.playername);
    this.printBoard(this.fixedTiles);
    this.Player.Room.updateBoard(
      this.Player.playername,
      this.fixedTiles,
      "fixed",
    );

    this.fallingPiece = null;
    this.newPiece();
  }
  recievePenalty(line: number): void {
    this.unpaidPenalties += line;
  }
  getPenalty(): void {
    if (this.unpaidPenalties === 0) return;

    const line = this.unpaidPenalties;
    const top = 0;
    const bottom = 19 - this.penaltyLine;
    this.penaltyLine += line;

    for (let row = top; row <= line; row++) {
      if (this.fixedTiles[row].some((element) => element > 0)) {
        this.gameover = true;
      }
    }
    for (let row = top; row + line <= bottom; row++) {
      this.fixedTiles[row] = [...this.fixedTiles[row + line]];
    }
    for (let row = bottom; row > bottom - line; row--) {
      this.fixedTiles[row].forEach((_, colIndex) => {
        this.fixedTiles[row][colIndex] = 20;
      });
    }
    console.log("from penalty", this.Player.playername);
    this.printBoard(this.fixedTiles);
    this.Player.Room.updateBoard(
      this.Player.playername,
      this.fixedTiles,
      "fixed",
    );

    this.unpaidPenalties = 0;

    if (this.gameover) {
      this.Player.gameover();
    }
  }
  isLineFull(y: number): boolean {
    if (y < 19 - this.penaltyLine) return false;
    for (let x = 0; x < 10; x++) {
      if (!this.fixedTiles[y][x]) {
        return false;
      }
    }
    return true;
  }

  clearLines(): void {
    let lineNumber = 0;
    if (this.fallingPiece) {
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
    }
    if (lineNumber > 1) {
      this.Player.Room.sendPenalty(this.Player.playername, lineNumber - 1);
    }
  }

  printBoard(board: number[][]): void {
    for (let row = 15; row <= 19; row++) {
      let rowString = "";
      for (let col = 0; col < this.width; col++) {
        rowString += board[row][col] > 0 ? "x" : ".";
      }
      console.log(rowString);
    }
    console.log("----");
  }

  freezeBoard(): void {
    if (this.fallingPiece) this.fallingPiece.stopPiece();
  }

  dropLocation(): { x: number; y: number; type: number }[] {
    if (this.fallingPiece) {
      let tiles = this.fallingPiece.dupTiles(this.fallingPiece.tiles);
      let testTiles = this.fallingPiece.dupTiles(this.fallingPiece.tiles);

      this.fallingPiece.moveTiles(testTiles, "down");
      while (this.isFree(testTiles)) {
        tiles = testTiles;
        this.fallingPiece.moveTiles(testTiles, "down");
      }
      console.log(tiles);
      return tiles;
    }
    return [];
  }
}

export default Board;
