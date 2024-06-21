class Game {
	constructor (roomName, leader) {
    this.roomName = roomName;
    this.players = [];
    this.players.push(leader);
    this.isActive = false;
    this.key = Math.random(); // TODO: change the logic later
    leader.waitingGame(this.key);
  }

  addPlayer(player) {
    this.players.push(player);
    player.waitingGame(this.key);
  }

  removePlayer(player) {
    this.players = this.players.filter(p => p !== player);
  }

  startGame() {
    this.isActive = true;
    this.players.forEach(player => {
      player.startGame();
    });
    // have to send key to each player
  }

  endGame() {
    this.isActive = false;
    // close all sockets
  }
}
