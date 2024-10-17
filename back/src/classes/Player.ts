import Board from './Board.js';

class Player {
  playername: string;
  socket: string; // Specify the correct type for socket, if known
  isLeader: boolean;
  Board: Board;
  isPlaying: boolean;
  Room: any; // Specify the correct type for Room, if known

  constructor(playername: string, socket: string, key: string, isLeader: boolean, Room: any) {
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
