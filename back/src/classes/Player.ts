import Board from './Board.js';

class Player {
  playername: string;
  socket: any; // Specify the correct type for socket, if known
  isLeader: boolean;
  Board: Board;
  isPlaying: boolean;
  Room: any; // Specify the correct type for Room, if known

  constructor(playername: string, socket: any, key: string, isLeader: boolean, Room: any) {
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

  clickStartButton(): void {
    if (!this.Room.isPlaying) {
      this.Room.startGame();
    }
  }

  gameover(): void {
    this.isPlaying = false;
    this.Room.onePlayerDied(this);
  }
}

export default Player;
