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
    this.waiters = [];
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
      this.waiters.push(newPlayer);
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
    if (!targetPlayer) {
      console.error(`try to disconnect, ${playername} is not in ${this.roomname}`)
      return;
    }
    let newLeader
    if (targetPlayer.isLeader == true) {
      if (this.players.length) {
        newLeader = this.players[1]
      } else if (this.waiters) {
        newLeader = this.waiters[0]
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
      this.waiters = this.waiters.filter(p => p.playername !== targetPlayer.playername);
    }
    console.log(`${c.YELLOW}%s${c.RESET} left from ${c.GREEN}%s${c.RESET}.`, playername, this.roomname)
    return (newLeader)
  }
  targetIsPlaying(playername) {
    const targetPlayer = this.players.find(player => player.playername === playername);
    const isPlaying = this.isPlaying && targetPlayer && targetPlayer.isPlaying
    if (isPlaying) {
      targetPlayer.Board.freezeBoard()
      targetPlayer.isPlaying = false;
      this.players.forEach(player => {
        player.socket.emit("leave", { player: playername, room: this.roomname })
      });
    }
    return (isPlaying)
  }

  startGame() {
    this.isPlaying = true;
    this.players.forEach(player => {
      player.isPlaying = true
      player.Board.newPiece();
    });
  }
  endGame(winner) {
    this.isPlaying = false;
    this.key = uuidv4();
    this.updateEndgameToPlayers(winner)
    this.updateEndgameToWaiters(winner)
    this.players.push(...this.waiters);
    this.waiters.length = 0;
    this.players.forEach(player => {
      player.updateKey(this.key);
    });
  }

  updateEndgameToPlayers(winner) {
    this.players.forEach(player => {
      player.socket.emit("endGame", { roomname: this.roomname, winner: winner, type: 'player' })
    });
  }
  updateEndgameToWaiters(winner) {
    this.waiters.forEach(player => {
      player.socket.emit("endGame", { roomname: this.roomname, winner: winner, type: 'waiter' })
    });
  }

  onePlayerDied(dier) {
    this.updateBoard(dier.playername, dier.Board.fixedTiles, 'died')
    this.players.forEach(player => {
      player.socket.emit("gameover", { roomname: this.roomname, dier: dier.playername })
    });
    console.log(`${c.YELLOW}%s${c.RESET} gameover in ${c.GREEN}%s${c.RESET}.`, dier.playername, this.roomname)
    const winner = this.players.filter(player => !player.Board.gameover);
    if (winner && winner.length == 1) {
      winner[0].Board.freezeBoard()
      this.endGame(winner[0].playername);
    }
  }
  updateBoard(playername, board, type) {
    this.players.forEach(player => {
      player.socket.emit('updateboard', { playername: playername, board: board, type: type })
    });
  }
  sendPenalty(sender, lines) {
    for (const player of this.players) {
      if (player.playername == sender) continue;
      player.Board.getPenalty(lines)
    }
    console.log(`${c.YELLOW}%s${c.RESET} sent ${c.RED}%d${c.RESET} lines penalty in ${c.GREEN}%s${c.RESET}.`, sender, lines, this.roomname)
  }
}

export default Room;
