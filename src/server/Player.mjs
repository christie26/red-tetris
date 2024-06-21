/*
Player class represent one player and also their own game.
In case they restart the game, they will get a new key.
*/
class Player {
  constructor (playername, socket) {
    this.playername = playername;
    this.socket = socket;
    this.Board = new this.Board();
  }

  waitingGame(key) {
    this.key = key;
    this.Board = new this.Board();
  }
  startGame() {
    this.Board.initGame();
  }
}
