"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("../app.js");
const Board_js_1 = __importDefault(require("./Board.js"));
class Player {
    playername;
    socket;
    isLeader;
    Board;
    isPlaying;
    Room;
    constructor(playername, socket, key, isLeader, Room) {
        this.playername = playername;
        this.socket = socket;
        this.isLeader = isLeader;
        this.Board = new Board_js_1.default(key, this);
        this.Board.key = key;
        this.isPlaying = false;
        this.Room = Room;
    }
    updateKey(key) {
        this.Board = new Board_js_1.default(key, this);
        this.Board.key = key;
    }
    gameover() {
        if (this.isPlaying) {
            this.isPlaying = false;
            this.Board.freezeBoard();
        }
        else {
            console.log("protected!");
        }
        this.Room.playerDied(this);
    }
    sendNextPiece(nextPiece) {
        app_js_1.io.to(this.socket).emit("nextpiece", { piece: nextPiece });
    }
}
exports.default = Player;
