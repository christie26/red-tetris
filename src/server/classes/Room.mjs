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
    const isLeader = this.players.length === 0;
    const newPlayer = new Player(playername, socket, this.key, isLeader, this);
    if (this.isPlaying == true) {
      this.waitingPlayers.push(newPlayer);
    } else {
      this.players.push(newPlayer);
    }
    if (this.players)
    {
      console.log(`room: ${this.roomName}, player: ${newPlayer.playername}, isLeader: ${newPlayer.isLeader}`)
      console.log(`isLeader: ${newPlayer.isLeader}, this.players.length: ${this.players.length}`)
    }
    return (isLeader)
  }

  removePlayer(playername) {
    // TODO : if everyone leave, what do we do? -> destroy the room i think
    // called when a user disconect
    let newLeader = "false"
    if (!this.players) {
      console.log("players doesn't exist in disconnect")
    }
    let targetPlayer = this.players.find(player => player.playername === playername)
    if (!targetPlayer){
      return;
    }
    console.log("Player to remove is ", targetPlayer.playername)
    if (targetPlayer.isLeader == true && this.players.length > 1) {
      this.players[1].isLeader = true;
      newLeader = this.players[1].playername
    }
    this.players = this.players.filter(p => p !== targetPlayer);
    this.waitingPlayers = this.waitingPlayers.filter(p => p !== targetPlayer);
    this.diePlayer++;
    console.log("In this room there is ", this.players.length, " players")
    if (this.players.length == 1)
    {
      this.endGame(this.players[0].playername)
    }
    return (newLeader)
  }

  startGame() {
    this.isPlaying = true;
    this.players.forEach(player => {
      player.Board.newPiece();
    });
  }
  endGame(winner) {
    this.isPlaying = false;
    this.key = uuidv4();
    this.sendWinnerToAllPlayers(winner)
    this.players.push(...this.waitingPlayers);
    this.waitingPlayers.length = 0;
    this.players.forEach(player => {
      player.updateKey(this.key);
    });
    this.sendToWaitingPlayers()
  }

  sendWinnerToAllPlayers(winner){
    this.players.forEach(player => {
      console.log("we send endGame to player ", player.playername)
      player.socket.emit("endGame", {winner: winner})
    });
  }
  sendToWaitingPlayers(){
    this.players.forEach(player => {
      player.socket.emit("endGamePlayAgain")
    });
  }

  onePlayerGameover() {
    console.log('game over!!!')
    this.diePlayer++;
    if (this.diePlayer == this.players.length - 1) {
      this.winner = this.players.some(player => !player.Board.gameover);
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
