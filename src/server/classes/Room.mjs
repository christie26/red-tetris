import Player from './Player.mjs';
import { v4 as uuidv4 } from 'uuid';
import io from '../../app.mjs';
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
    this.winner = null;
    console.log(`${c.GREEN}%s${c.RESET} is created`, roomname);
  }
  getPlayerList() {
    return this.players.map(player => player.playername)
  }
  addPlayer(playername, socket) {
    const isLeader = this.players.length === 0;
    const newPlayer = new Player(playername, socket, this.key, isLeader, this);
    if (this.isPlaying == true) {
      this.waiters.push(newPlayer);
      io.emit("join", { roomname: this.roomname, player: playername, playerlist: this.getPlayerList(), type: 'wait' })
      console.log(`${c.YELLOW}%s${c.RESET} joinned to ${c.GREEN}%s${c.RESET} as a waiter.`, playername, this.roomname)
    } else {
      this.players.push(newPlayer);
      if (this.players.length == 1) {
        io.emit("join", { roomname: this.roomname, player: playername, playerlist: this.getPlayerList(), type: 'leader' })
        console.log(`${c.YELLOW}%s${c.RESET} joinned to ${c.GREEN}%s${c.RESET} as a leader.`, playername, this.roomname)
      }
      else {
        io.emit("join", { roomname: this.roomname, player: playername, playerlist: this.getPlayerList(), type: 'normal' })
        console.log(`${c.YELLOW}%s${c.RESET} joinned to ${c.GREEN}%s${c.RESET} as a player.`, playername, this.roomname)
      }
    }
    return (isLeader)
  }
  setNewLeader() {
    let newLeader
    if (this.players.length > 1) {
      newLeader = this.players[1]
    } else if (this.waiters.length) {
      newLeader = this.waiters[0]
    } else {
      return;
    }
    newLeader.isLeader = true;
    io.emit('newLeader', { roomname: this.roomname, playername: newLeader.playername })
    console.log(`${c.YELLOW}%s${c.RESET} became new leader.`, newLeader.playername)
  }
  playerDisconnect(playername) {
    if (!this.players) {
      console.error(`try to disconnect, no player in ${this.roomname}`)
      return;
    }
    const targetPlayer = this.players.find(player => player.playername === playername)
    if (!targetPlayer) {
      this.waiters = this.waiters.filter(p => p.playername !== playername);
      return;
    }
    if (targetPlayer.isLeader == true)
      this.setNewLeader()

    this.freezeIfPlaying(playername)
    this.players = this.players.filter(p => p.playername !== playername);

    if (this.players.length == 1 && this.isPlaying)
      this.endGame(this.players[0].playername)

    io.emit("leave", { roomname: this.roomname, player: playername, playerlist: this.getPlayerList() })
    console.log(`${c.YELLOW}%s${c.RESET} left from ${c.GREEN}%s${c.RESET}.`, playername, this.roomname)
  }
  freezeIfPlaying(playername) {
    const targetPlayer = this.players.find(player => player.playername === playername);
    if (this.isPlaying && targetPlayer && targetPlayer.isPlaying) {
      targetPlayer.Board.freezeBoard()
      targetPlayer.isPlaying = false;
    }
  }

  startGame(playername) {
    console.log(`${c.YELLOW}%s${c.RESET} began a game.`, playername)
    io.emit("startgame", { roomname: this.roomname, playerList: this.getPlayerList() })
    this.isPlaying = true;
    this.players.forEach(player => {
      player.isPlaying = true
      player.Board.newPiece();
    });
  }
  endGame(winner) {
    this.isPlaying = false;
    // TODO : think how to handle differently from the client-side
    io.emit("endGame", { roomname: this.roomname, winner: winner, type: 'player' })
    io.emit("endGame", { roomname: this.roomname, winner: winner, type: 'waiter' })
    this.players.push(...this.waiters);
    this.waiters.length = 0;

    this.key = uuidv4();
    this.players.forEach(player => {
      player.updateKey(this.key);
    });
  }

  onePlayerDied(dier) {
    this.updateBoard(dier.playername, dier.Board.fixedTiles, 'died')
    io.emit("gameover", { roomname: this.roomname, dier: dier.playername })
    console.log(`${c.YELLOW}%s${c.RESET} gameover in ${c.GREEN}%s${c.RESET}.`, dier.playername, this.roomname)
    const winner = this.players.filter(player => !player.Board.gameover);
    if (winner && winner.length == 1) {
      winner[0].Board.freezeBoard()
      this.endGame(winner[0].playername);
    }
  }
  updateBoard(playername, board, type) {
    io.emit('updateboard', { roomname: this.roomname, player: playername, board: board, type: type })
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
