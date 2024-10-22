import Board from "./Board";
import Room from "./Room";

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
    this.Board = new Board(this.socket, key, this);
    this.isPlaying = false;
    this.Room = Room;
  }

  updateKey(key: string): void {
    this.Board = new Board(this.socket, key, this);
  }

  gameover(): void {
    this.isPlaying = false;
    this.Room.onePlayerDied(this);
  }
}

export default Player;
