/*
Player class represent one player and also their own game.
In case they restart the game, they will get a new key.
*/
import Board from './Board.mjs';

class Player {
  constructor (playername, socket) {
    this.playername = playername;
    this.socket = socket;
    this.Board = new Board(this.socket);
  }

  waitingGame(key) {
    this.key = key;
  }
  startGame() {
    this.Board.newPiece();
  }
}

export default Player;
