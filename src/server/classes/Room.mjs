import Player from './Player.mjs';
import { v4 as uuidv4 } from 'uuid';
/*
Room class represents each room.
It has all players.
It can start, end, restart the game.
*/

const c = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RESET: '\x1b[0m'
};
class Room {
  constructor(roomname) {
    this.roomname = roomname;
    this.players = [];
    this.waitingPlayers = [];
    this.isPlaying = false;
    this.key = uuidv4();
    this.diePlayer = 0;
    this.winner = null;
    console.log(`${c.GREEN}%s${c.RESET} is created`, roomname);
  }

  addPlayer(playername, socket) {
    const isLeader = this.players.length === 0;
    const newPlayer = new Player(playername, socket, this.key, isLeader, this);
    if (this.isPlaying == true) {
      this.waitingPlayers.push(newPlayer);
    console.log(`${c.YELLOW}%s${c.RESET} joinned to ${c.GREEN}%s${c.RESET} as waitingPlayer.`, playername, this.roomname)
  } else {
      this.players.push(newPlayer);
    console.log(`${c.YELLOW}%s${c.RESET} joinned to ${c.GREEN}%s${c.RESET} as player.`, playername, this.roomname)
    }
    return (isLeader)
  }
  removePlayer(playername) {
    if (!this.players) {
      console.error(`try to disconnect, no player in ${this.roomname}`)
      return;
    }
    const targetPlayer = this.players.find(player => player.playername === playername)
    if (!targetPlayer){
      console.error(`try to disconnect, ${playername} is not in ${this.roomname}`)
      return;
    }
    let newLeader
    if (targetPlayer.isLeader == true) {
      if (this.players.length) {
        newLeader = this.players[1]
      } else if (this.waitingPlayers) {
        newLeader = this.waitingPlayers[0]
      }
      if (newLeader) {
        newLeader.isLeader = true;
        console.log(`${c.YELLOW}%s${c.RESET} became new leader.`, newLeader.playername)
      }
    }
    const targetIsPlaying = this.targetIsPlaying(playername)
    if (targetIsPlaying) {
      this.players = this.players.filter(p => p.playername !== targetPlayer.playername);
      this.diePlayer++;
      if (this.players.length == 1)
        this.endGame(this.players[0].playername)
    } else {
      this.players = this.players.filter(p => p.playername !== targetPlayer.playername);
      this.waitingPlayers = this.waitingPlayers.filter(p => p.playername !== targetPlayer.playername);
    }
    console.log(`${c.YELLOW}%s${c.RESET} left from ${c.GREEN}%s${c.RESET}.`, playername, this.roomname)
    return (newLeader)
  }

  targetIsPlaying(playername) {
    return (this.isPlaying && this.players.some(player => player.playername === playername))
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
    console.log(`In ${this.roomname}, ${player} sent ${lines} lines penalty`);
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
