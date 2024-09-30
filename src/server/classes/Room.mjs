import Player from './Player.mjs';
import { v4 as uuidv4 } from 'uuid';
/*
Room class represents each room.
It has all players.
It can start, end, restart the game.
*/
class Room {
  constructor(roomname) {
    this.roomName = roomname;
    this.players = [];
    this.waitingPlayers = [];
    this.isPlaying = false;
    this.key = uuidv4();
    this.diePlayer = 0;
    this.winner = null;
  }

  addPlayer(playername, socket) {
    let isLeader = false 
    if(this.players.length == 0){
      console.log("no Player in this game")
      isLeader = true
    }
    const newPlayer = new Player(playername, socket, this.key, isLeader, this);
    if (this.isPlaying == true) {
      this.waitingPlayers.push(newPlayer);
    } else {
      this.players.push(newPlayer);
    }
    if (this.players)
    {
      console.log("This Room name is ", this.roomName, " my playername is ", newPlayer.playername, " isLeader is ", newPlayer.isLeader)
      console.log("this.players count ", this.players.length)
    }
    return (isLeader)
  }

  removePlayer(playername) {
    // TODO : if everyone leave, what do we do?
    // called when a user disconect
    if (!this.players) {
      console.log("players doesn't exist in disconnect")
    }
    let targetPlayer = this.players.find(player => player.playername === playername)
    if (!targetPlayer){
      return;
    }
    console.log("Player to remove is ", targetPlayer.playername)
    if (targetPlayer.isLeader == true && this.players.length > 1) {
      players[1].isLeader = true;
    }
    this.players = this.players.filter(p => p !== targetPlayer);
    this.waitingPlayers = this.waitingPlayers.filter(p => p !== targetPlayer);
  }

  startGame() {
    this.isPlaying = true;
    this.players.forEach(player => {
      console.log("player is ", player.playername, "in room ", this.roomName)
      player.Board.newPiece();
    });
  }
  endGame() {
    // TODO-Balkis : announce the result with winner info.
    this.isPlaying = false;
    this.key = uuidv4();
    // TODO-Balkis : announce them that they are joined now. it means it can start whenever (leader press the button) ✅
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
    // TODO-Yoonseo : send penalty to all player except the player.
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
