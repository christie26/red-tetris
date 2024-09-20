import Player from './Player.mjs';
import { v4 as uuidv4 } from 'uuid';
/*
Room class represents each room.
It has all players.
It can start, end, restart the game.
*/
class Room {
  constructor(roomName) {
    this.roomName = roomName;
    this.players = [];
    this.waitingPlayers = [];
    this.isPlaying = false;
    this.key = uuidv4();
    this.diePlayer = 0;
    this.winner = null;
  }

  addPlayer(playername, socket) {
    const isLeader = false 
    if(!this.players)
      isLeader = true
    const newPlayer = new Player(playername, socket, this.key, isLeader, this);
    if (this.isPlaying == true) {
      this.waitingPlayers.push(newPlayer);
    } else {
      this.players.push(newPlayer);
    }
  }
  removePlayer(targetPlayer) {
    // TODO : if everyone leave, what do we do?
    if (targetPlayer.isLeader == true && this.players.length > 1) {
      players[1].isLeader = true;
    }
    this.players = this.players.filter(p => p !== targetPlayer);
    this.waitingPlayers = this.waitingPlayers.filter(p => p !== targetPlayer);
  }

  startGame() {
    this.isPlaying = true;
    this.players.forEach(player => {
      player.board.newPiece();
    });
  }
  endGame() {
    // TODO : announce the result with winner info.
    this.isPlaying = false;
    this.key = uuidv4();
    // TODO : announce them that they are joined now. it means it can start whenever (leader press the button)
    players.push(...this.waitingPlayers);
    this.waitingPlayers.length = 0;
    this.players.forEach(player => {
      player.updateKey(this.key);
    });
  }
  onePlayerGameover() {
    console.log('game over!!!')
    this.diePlayer++;
    if (this.diePlayer == this.players.length - 1) {
      this.winner = players.some(player => !player.Board.gameover);
      this.endGame();
    }
  }
  sendPenalty(player, lines) {
    console.log(`In ${this.roomName}, ${player} sent ${lines} lines penalty`);
    // TODO : send penalty to all player except the player.
  }
}

export default Room;

/*
parse URL
└ if Room exists
  └ YES -> room.addPlayer
  └ NO  -> create Room
        -> room.addPlayer (= create Player)
*/
