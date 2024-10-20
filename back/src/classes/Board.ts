import Piece from "./Piece.js";
import seedrandom from "seedrandom";
import Player from "./Player.js";
import Tile from "./Tile.js";

class Board {
  socket: string;
  width: number = 10;
  height: number = 20;
  intervalId: NodeJS.Timeout | null = null;
  fallingPiece: Piece | null = null;
  fixedTiles: number[][] = Array.from({ length: 20 }, () => new Array(10).fill(0));
  Player: Player;
  penaltyLine: number = 0;
  unpaidPenalties: number = 0;
  createRandom: () => number;
  speedLevel: number = 1;

  constructor(socket: string, key: string, Player: Player) {
    this.socket = socket;
    this.Player = Player;
    this.createRandom = seedrandom(key);
  }

  startgame(): void {
    this.newPiece();
  }
  /* routine */
  private newPiece(): void {
    this.fallingPiece = null;

    // let type: number = 6;
    let type: number = Math.floor(this.createRandom() * 7);
    let left: number = 3 + Math.floor(this.createRandom() * 4);
    let direction: number = Math.floor(this.createRandom() * 4);

    this.fallingPiece = new Piece(type, left, direction);
    if (this.touchOtherPiece(this.fallingPiece.tiles)) {
      for (const tile of this.fallingPiece.tiles) {
        this.fixedTiles[tile.y][tile.x] = tile.type;
      }
      this.freezeBoard();
      this.Player.gameover();
      return;
    }

    this.renderPiece();
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.routine(), 500 / this.speedLevel);
  }
  private routine() {
    if (this.canGoDown()) {
      this.moveTiles(this.fallingPiece.tiles, "down");
      this.renderPiece();

      this.applyPenalty();
      return;
    } else {
      this.fixPieceToBoard();
      this.Player.Room.updateBoard(this.Player, this.fixedTiles, "fixed");

      this.clearLinesAndSendPenalty();
      this.Player.Room.updateBoard(this.Player, this.fixedTiles, "fixed");

      this.applyPenalty();

      this.newPiece();
    }
  }
  private canGoDown(): boolean {
    let tempTiles = this.dupTiles(this.fallingPiece.tiles);
    this.moveTiles(tempTiles, "down");
    return this.isFree(tempTiles);
  }

  /* change speed */
  changeSpeedMode(speedMode: string) {
    let speed;
    switch (speedMode) {
      case "normal":
        speed = 500 / this.speedLevel;
      case "fast":
        speed = 50 / this.speedLevel;
      case "sprint":
        speed = 5;
    }
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.routine();
    }, speed);
  }
  changeSpeedLevel(newSpeedLevel: number) {
    this.speedLevel = newSpeedLevel;
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.routine();
    }, 500 / this.speedLevel);
  }

  /* move & rotate piece */
  moveSide(direction: "left" | "right"): void {
    let tempTiles = this.dupTiles(this.fallingPiece.tiles);
    this.moveTiles(tempTiles, direction);

    if (this.isFree(tempTiles)) {
      this.moveTiles(this.fallingPiece.tiles, direction);
      this.renderPiece();
    }
  }
  rotatePiece(): void {
    if (this.fallingPiece.tiles[0].type === 7) return;

    let tempTiles = this.dupTiles(this.fallingPiece.tiles);
    this.rotateTiles(tempTiles);

    if (!this.isFree(tempTiles)) {
      const directions = ["left", "right", "down", "up"] as const;
      const successfulMove = this.tryMoveInDirections(tempTiles, directions);
      if (!successfulMove) return;
    }

    this.rotateTiles(this.fallingPiece.tiles);
    this.renderPiece();
  }
  private tryMoveInDirections(
    tempTiles: Tile[],
    directions: readonly ("left" | "right" | "down" | "up")[],
  ): boolean {
    for (const direction of directions) {
      let doubleTemp = this.dupTiles(tempTiles);
      this.moveTiles(doubleTemp, direction);

      if (this.isFree(doubleTemp)) {
        this.moveTiles(this.fallingPiece.tiles, direction);
        return true;
      }
    }
    return false;
  }

  /* move & rotate tiles */
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

  /* check board */
  private isFree(tiles: Tile[]): boolean {
    return !this.touchBorder(tiles) && !this.touchOtherPiece(tiles);
  }
  private touchBorder(tempTiles: Tile[]): boolean {
    for (const tile of tempTiles) {
      if (
        tile.x < 0 ||
        tile.x >= this.width ||
        tile.y >= this.height ||
        tile.y < 0
      )
        return true;
    }
    return false;
  }
  private touchOtherPiece(tempTiles: Tile[]): boolean {
    for (const tile of tempTiles) {
      if (this.fixedTiles[tile.y][tile.x]) {
        return true;
      }
    }
    return false;
  }

  /* render piece */
  private renderPiece(): void {
    let board = this.fixedTiles.map((row) => [...row]);
    if (this.fallingPiece) {
      const drop = this.dropLocation();
      for (const tile of drop) {
        board[tile.y][tile.x] = 10;
      }
      for (const tile of this.fallingPiece.tiles) {
        board[tile.y][tile.x] = tile.type;
      }
    }
    this.Player.Room.updateBoard(this.Player, board, "falling");
  }
  private fixPieceToBoard(): void {
    for (const tile of this.fallingPiece.tiles) {
      this.fixedTiles[tile.y][tile.x] = tile.type + 10;
    }
  }

  /* penalty */
  recievePenalty(line: number): void {
    this.unpaidPenalties += line;
  }
  private applyPenalty(): void {
    let gameover = false;
    if (this.unpaidPenalties === 0) return;

    const line = this.unpaidPenalties;
    const top = 0;
    const bottom = 19 - this.penaltyLine;
    this.penaltyLine += line;

    for (let row = top; row <= line; row++) {
      if (this.fixedTiles[row].some((element) => element > 0)) {
        gameover = true;
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
    this.Player.Room.updateBoard(this.Player, this.fixedTiles, "fixed");
    this.unpaidPenalties = 0;

    if (gameover) {
      this.freezeBoard();
      this.Player.gameover();
    }
  }

  /* clear line */
  private clearLinesAndSendPenalty(): void {
    const linesToClear: Set<number> = new Set();

    if (this.fallingPiece) {
      for (const tile of this.fallingPiece.tiles) {
        if (linesToClear.has(tile.y)) continue;
        if (this.isLineFull(tile.y)) {
          linesToClear.add(tile.y);
        }
      }
      linesToClear.forEach((y) => {
        for (let row = y; row > 0; row--) {
          for (let x = 0; x < this.width; x++) {
            this.fixedTiles[row][x] = this.fixedTiles[row - 1][x];
          }
        }
        for (let x = 0; x < this.width; x++) {
          this.fixedTiles[0][x] = 0;
        }
      });
    }
    if (linesToClear.size > 1) {
      this.Player.Room.sendPenalty(
        this.Player.playername,
        linesToClear.size - 1,
      );
    }
  }
  private isLineFull(y: number): boolean {
    if (y > 19 - this.penaltyLine) return false;
    for (let x = 0; x < 10; x++) {
      if (!this.fixedTiles[y][x]) {
        return false;
      }
    }
    return true;
  }

  /* freeze board */
  freezeBoard(): void {
    clearInterval(this.intervalId!);
  }

  /* utilities */
  private dupTiles(tiles: Tile[]): Tile[] {
    return tiles.map((tile) => new Tile(tile.x, tile.y, tile.type));
  }
  private dropLocation(): Tile[] {
    let tiles = this.dupTiles(this.fallingPiece.tiles);
    let testTiles = this.dupTiles(this.fallingPiece.tiles);

    this.moveTiles(testTiles, "down");
    while (this.isFree(testTiles)) {
      tiles = this.dupTiles(testTiles);
      this.moveTiles(testTiles, "down");
    }
    return tiles;
  }
  private printBoard(board: number[][]): void {
    for (let row = 15; row <= 19; row++) {
      let rowString = "";
      for (let col = 0; col < this.width; col++) {
        rowString += board[row][col] > 0 ? "x" : ".";
      }
      console.log(rowString);
    }
    console.log("----");
  }
}

export default Board;
