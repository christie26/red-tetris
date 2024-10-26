import { io } from "../app.js";
import Board from "./Board.js";
import Piece from "./Piece.js";
import Room from "./Room.js";

class Player {
  playername: string;
  socket: string;
  isLeader: boolean;
  Board: Board;
  isPlaying: boolean;
  Room: Room;

  constructor(
    playername: string,
    socket: string,
    key: string,
    isLeader: boolean,
    Room: Room,
  ) {
    this.playername = playername;
    this.socket = socket;
    this.isLeader = isLeader;
    this.Board = new Board(key, this);
    this.isPlaying = false;
    this.Room = Room;
  }

  updateKey(key: string): void {
    this.Board = new Board(key, this);
  }

  gameover(): void {
    this.isPlaying = false;
    this.Board.freezeBoard();
    this.Room.onePlayerDied(this);
  }

  sendNextPiece(nextPiece: Piece): void {
    io.to(this.socket).emit("nextpiece", { piece: nextPiece });
  }
}

export default Player;
