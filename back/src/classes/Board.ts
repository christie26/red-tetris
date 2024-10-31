import Piece from "./Piece.js";
import seedrandom from "seedrandom";
import Player from "./Player.js";
import Tile from "./Tile.js";

const c = {
  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  RESET: "\x1b[0m",
};

class Board {
  width: number = 10;
  height: number = 20;
  intervalId: NodeJS.Timeout | null = null;
  currentPiece: Piece;
  nextPiece: Piece;
  fixedTiles: number[][] = Array.from({ length: 20 }, () =>
    new Array(10).fill(0),
  );
  Player: Player;
  penaltyLine: number = 0;
  unpaidPenalties: number = 0;
  createRandom: () => number;
  speedLevel: number = 1;

  constructor(key: string, Player: Player) {
    this.Player = Player;
    this.createRandom = seedrandom(key);
    this.currentPiece = this.createPiece();
    this.nextPiece = this.createPiece();
  }

  startgame(): void {
    if (!this.currentPiece || !this.currentPiece.tiles) {
      console.error("Current piece is invalid");
      return;
    }
    if (this.touchOtherPiece(this.currentPiece.tiles)) {
      for (const tile of this.currentPiece.tiles) {
        this.fixedTiles[tile.y][tile.x] = tile.type;
      }
      this.Player.gameover();
      return;
    }

    this.renderPiece();
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.routine(), 500 / this.speedLevel);
    this.Player.sendNextPiece(this.nextPiece);
  }
  /* routine */
  private createPiece(): Piece {
    const type: number = Math.floor(this.createRandom() * 7);
    const left: number = 3 + Math.floor(this.createRandom() * 4);
    const direction: number = Math.floor(this.createRandom() * 4);

    return new Piece(type, left, direction);
  }
  newPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.createPiece();
    this.Player.sendNextPiece(this.nextPiece);

    if (this.touchOtherPiece(this.currentPiece.tiles)) {
      for (const tile of this.currentPiece.tiles) {
        this.fixedTiles[tile.y][tile.x] = tile.type;
      }
      this.Player.gameover();
      return;
    }

    this.renderPiece();
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.routine(), 500 / this.speedLevel);
  }
   routine() {
    if (this.canGoDown()) {
      this.moveTiles(this.currentPiece.tiles, "down");
      this.renderPiece();

      if (this.applyPenalty())
        this.newPiece();
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
    if (!this.currentPiece) return;
    let tempTiles = this.dupTiles(this.currentPiece.tiles);
    this.moveTiles(tempTiles, "down");
    return this.isFree(tempTiles);
  }

  /* change speed */
  changeSpeedMode(speedMode: string) {
    let speed: number;
    switch (speedMode) {
      case "normal":
        speed = 500 / this.speedLevel;
        break;
      case "fast":
        speed = 50 / this.speedLevel;
        break;
      case "sprint":
        speed = 5;
        break;
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
    if (!this.currentPiece) return;
    let tempTiles = this.dupTiles(this.currentPiece.tiles);
    this.moveTiles(tempTiles, direction);

    if (this.isFree(tempTiles)) {
      this.moveTiles(this.currentPiece.tiles, direction);
      this.renderPiece();
    }
  }
  rotatePiece(): void {
    if (!this.currentPiece) return;
    if (this.currentPiece.tiles[0].type === 7) return;

    let tempTiles = this.dupTiles(this.currentPiece.tiles);
    this.rotateTiles(tempTiles);

    if (!this.isFree(tempTiles)) {
      const directions = ["left", "right", "down", "up"] as const;
      const successfulMove = this.tryMoveInDirections(tempTiles, directions);
      if (!successfulMove) return null;
    }

    this.rotateTiles(this.currentPiece.tiles);
    this.renderPiece();
  }
  private tryMoveInDirections(
    tempTiles: Tile[],
    directions: readonly ("left" | "right" | "down" | "up")[],
  ): boolean {
    if (!this.currentPiece) return;
    for (const direction of directions) {
      let doubleTemp = this.dupTiles(tempTiles);
      this.moveTiles(doubleTemp, direction);

      if (this.isFree(doubleTemp)) {
        this.moveTiles(this.currentPiece.tiles, direction);
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
    if (this.currentPiece) {
      const drop = this.dropLocation();
      for (const tile of drop) {
        board[tile.y][tile.x] = 10;
      }
      for (const tile of this.currentPiece.tiles) {
        board[tile.y][tile.x] = tile.type;
      }
    }
    this.Player.Room.updateBoard(this.Player, board, "falling");
  }
  fixPieceToBoard(): void {
    for (const tile of this.currentPiece.tiles) {
      this.fixedTiles[tile.y][tile.x] = tile.type + 10;
    }
  }

  /* penalty */
  recievePenalty(line: number): void {
    this.unpaidPenalties += line;
  }
  applyPenalty(): boolean {
    let gameover = false;
    let skip = false;
    if (this.unpaidPenalties === 0) return;

    const line = this.unpaidPenalties;
    const top = 0;
    const bottom = 19 - this.penaltyLine;
    this.penaltyLine += line;
    this.unpaidPenalties = 0;

    skip = this.fixPieceIfTouch(line);
    for (let row = top; row <= line; row++) {
      if (this.fixedTiles[row].some((element) => element > 0)) {
        gameover = true;
      } // check gameover
    }
    for (let row = top; row + line <= bottom; row++) {
      this.fixedTiles[row] = [...this.fixedTiles[row + line]];
    } // update line up
    for (let row = bottom; row > bottom - line; row--) {
      this.fixedTiles[row].forEach((_, colIndex) => {
        this.fixedTiles[row][colIndex] = 20;
      }); // update board with Penalty
    }
    this.Player.Room.updateBoard(this.Player, this.fixedTiles, "fixed");

    if (gameover) {
      this.Player.gameover();
    }
    return skip;
  }
  fixPieceIfTouch(line: number) : boolean {
    const dropTile = this.dropLocation();
    const distance = this.currentPiece.tiles[0].y - dropTile[0].y;
    if (line < distance) return false;
    else if (line === distance) {
      this.fixPieceToBoard();
      return true;
    } else {
      for (const tile of this.currentPiece.tiles) {
        tile.y -= distance;
      }
      this.fixPieceToBoard();
      return true;
    }
  }

  /* clear line */
   clearLinesAndSendPenalty(): void {
    const linesToClear: number[] = new Array(0).fill(0);

    if (this.currentPiece) {
      for (const tile of this.currentPiece.tiles) {
        if (this.isLineFull(tile.y)) {
          if (linesToClear.includes(tile.y)) continue;
          linesToClear.push(tile.y);
        }
      }
      linesToClear.sort();
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
    if (linesToClear.length > 1) {
      this.Player.Room.sendPenalty(
        this.Player.playername,
        linesToClear.length - 1,
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
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} board freeze.`,
      this.Player.Room.roomname,
      this.Player.playername,
    );
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.currentPiece = null;
  }

  /* utilities */
  private dupTiles(tiles: Tile[]): Tile[] {
    return tiles.map((tile) => new Tile(tile.x, tile.y, tile.type));
  }
  private dropLocation(): Tile[] {
    let tiles = this.dupTiles(this.currentPiece.tiles);
    let testTiles = this.dupTiles(this.currentPiece.tiles);

    this.moveTiles(testTiles, "down");
    while (this.isFree(testTiles)) {
      tiles = this.dupTiles(testTiles);
      this.moveTiles(testTiles, "down");
    }
    return tiles;
  }
  private printBoard(board: number[][]): void { // they qsked to test but we dont use it so te remove or comment befor to push
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