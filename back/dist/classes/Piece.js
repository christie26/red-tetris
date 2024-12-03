"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Pieces_js_1 = __importDefault(require("../Pieces.js"));
const Tile_js_1 = __importDefault(require("./Tile.js"));
class Piece {
    type;
    tiles;
    constructor(type, left, direction) {
        this.type = type;
        this.tiles = [];
        for (let i = 0; i < 4; i++) {
            const index = Pieces_js_1.default[type][direction][i];
            this.tiles.push(new Tile_js_1.default((index % 10) + left, Math.floor(index / 10), this.type + 1));
        }
        this.type++;
    }
}
exports.default = Piece;
