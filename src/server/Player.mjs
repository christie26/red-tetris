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
}
