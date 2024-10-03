import Board from './Board.mjs';
/*
Player class represents one player.
When they restart a game, they will get a new key and create new Board.
*/

class Player {
  constructor(playername, socket, key, isLeader, Room) {
    this.playername = playername;
    this.socket = socket;
    this.isLeader = isLeader
    this.Board = new Board(this.socket, key, this);
    this.Room = Room;
  }

  updateKey(key) {
    this.Board = new Board(this.socket, key, this);
  }
  startGame() {
    if (this.Room.isPlaying == false) {
      this.Room.startGame()
    }
  }
  gameOver() {
    //CONCERN : should we send to everyone?
    this.socket.emit('updateboard', {playername: this.Player.playername, board: this.Board.fixedTiles})
    this.Room.onePlayerGameover(this)
  }
}

export default Player;
