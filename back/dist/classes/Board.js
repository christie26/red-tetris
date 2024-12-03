"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Piece_js_1 = __importDefault(require("./Piece.js"));
const seedrandom_1 = __importDefault(require("seedrandom"));
const Tile_js_1 = __importDefault(require("./Tile.js"));
const c = {
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    RESET: "\x1b[0m",
};
class Board {
    width = 10;
    height = 20;
    intervalId = null;
    currentPiece;
    nextPiece;
    fixedTiles = Array.from({ length: 20 }, () => new Array(10).fill(0));
    Player;
    penaltyLine = 0;
    unpaidPenalties = 0;
    createRandom;
    speedLevel = 1;
    key;
    constructor(key, Player) {
        this.Player = Player;
        this.createRandom = (0, seedrandom_1.default)(key);
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
    }
    startgame() {
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
    createPiece() {
        const type = Math.floor(this.createRandom() * 7);
        const left = 3 + Math.floor(this.createRandom() * 4);
        const direction = Math.floor(this.createRandom() * 4);
        return new Piece_js_1.default(type, left, direction);
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
        }
        else {
            this.fixPieceToBoard();
            this.Player.Room.updateBoard(this.Player.playername, this.fixedTiles, "fixed");
            this.clearLinesAndSendPenalty();
            this.Player.Room.updateBoard(this.Player.playername, this.fixedTiles, "fixed");
            this.applyPenalty();
            this.newPiece();
        }
    }
    canGoDown() {
        if (!this.currentPiece)
            return;
        let tempTiles = this.dupTiles(this.currentPiece.tiles);
        this.moveTiles(tempTiles, "down");
        return this.isFree(tempTiles);
    }
    /* change speed */
    changeSpeedMode(speedMode) {
        let speed;
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
    changeSpeedLevel(newSpeedLevel) {
        this.speedLevel = newSpeedLevel;
        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
            this.routine();
        }, 500 / this.speedLevel);
    }
    /* move & rotate piece */
    moveSide(direction) {
        if (!this.currentPiece)
            return;
        let tempTiles = this.dupTiles(this.currentPiece.tiles);
        this.moveTiles(tempTiles, direction);
        if (this.isFree(tempTiles)) {
            this.moveTiles(this.currentPiece.tiles, direction);
            this.renderPiece();
        }
    }
    rotatePiece() {
        if (!this.currentPiece)
            return;
        if (this.currentPiece.tiles[0].type === 7)
            return;
        let tempTiles = this.dupTiles(this.currentPiece.tiles);
        this.rotateTiles(tempTiles);
        if (!this.isFree(tempTiles)) {
            const directions = ["left", "right", "down", "up"];
            const successfulMove = this.tryMoveInDirections(tempTiles, directions);
            if (!successfulMove)
                return null;
        }
        this.rotateTiles(this.currentPiece.tiles);
        this.renderPiece();
    }
    tryMoveInDirections(tempTiles, directions) {
        if (!this.currentPiece)
            return;
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
    moveTiles(tiles, direction) {
        tiles.forEach((tile) => {
            if (direction === "left") {
                tile.x--;
            }
            else if (direction === "right") {
                tile.x++;
            }
            else if (direction === "down") {
                tile.y++;
            }
        });
    }
    rotateTiles(tiles) {
        if (tiles[0].type === 0)
            return;
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
    isFree(tiles) {
        return !this.touchBorder(tiles) && !this.touchOtherPiece(tiles);
    }
    touchBorder(tempTiles) {
        for (const tile of tempTiles) {
            if (tile.x < 0 ||
                tile.x >= this.width ||
                tile.y >= this.height ||
                tile.y < 0)
                return true;
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
    /* render piece */
    renderPiece() {
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
        this.Player.Room.updateBoard(this.Player.playername, board, "falling");
    }
    fixPieceToBoard() {
        for (const tile of this.currentPiece.tiles) {
            this.fixedTiles[tile.y][tile.x] = tile.type + 10;
        }
    }
    /* penalty */
    recievePenalty(line) {
        this.unpaidPenalties += line;
    }
    applyPenalty() {
        let gameover = false;
        let skip = false;
        if (this.unpaidPenalties === 0)
            return;
        const line = this.unpaidPenalties;
        const top = 0;
        const bottom = 19 - this.penaltyLine;
        this.penaltyLine += line;
        this.unpaidPenalties = 0;
        skip = this.fixPieceIfTouch(line);
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
        this.renderPiece();
        if (gameover) {
            this.Player.gameover();
        }
        return skip;
    }
    fixPieceIfTouch(penaltyLine) {
        const dropTile = this.dropLocation();
        const distance = dropTile[0].y - this.currentPiece.tiles[0].y;
        if (penaltyLine > distance) {
            for (const tile of this.currentPiece.tiles) {
                tile.y += distance;
            }
            this.fixPieceToBoard();
            return true;
        }
        else
            return false;
    }
    /* clear line */
    clearLinesAndSendPenalty() {
        const linesToClear = new Array(0).fill(0);
        if (this.currentPiece) {
            for (const tile of this.currentPiece.tiles) {
                if (this.isLineFull(tile.y)) {
                    if (linesToClear.includes(tile.y))
                        continue;
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
            this.Player.Room.sendPenalty(this.Player.playername, linesToClear.length - 1);
        }
    }
    isLineFull(y) {
        if (y > 19 - this.penaltyLine)
            return false;
        for (let x = 0; x < 10; x++) {
            if (!this.fixedTiles[y][x]) {
                return false;
            }
        }
        return true;
    }
    /* freeze board */
    freezeBoard() {
        console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} board freeze.`, this.Player.Room.roomname, this.Player.playername);
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
    /* utilities */
    dupTiles(tiles) {
        return tiles.map((tile) => new Tile_js_1.default(tile.x, tile.y, tile.type));
    }
    dropLocation() {
        let tiles = this.dupTiles(this.currentPiece.tiles);
        let testTiles = this.dupTiles(this.currentPiece.tiles);
        this.moveTiles(testTiles, "down");
        while (this.isFree(testTiles)) {
            tiles = this.dupTiles(testTiles);
            this.moveTiles(testTiles, "down");
        }
        return tiles;
    }
}
exports.default = Board;
