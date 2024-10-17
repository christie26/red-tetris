import Player from './Player.js';
import { v4 as uuidv4 } from 'uuid';
import io from '../app.js';

const c = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RESET: '\x1b[0m'
};

class Room {
  public roomname: string;
  public players: Player[] = [];
  public waiters: Player[] = [];
  public isPlaying: boolean = false;
  public key: string = uuidv4();
  public winner: string | null = null;

  constructor(roomname: string) {
    this.roomname = roomname;
    console.log(`[${c.GREEN}%s${c.RESET}] is created`, roomname);
  }

  getPlayerlist(): string[] {
    return this.players.map(player => player.playername);
  }

  addPlayer(playername: string, socketId: string): void {
    const isLeader = this.players.length === 0;
    const newPlayer = new Player(playername, socketId, this.key, isLeader, this);
    const role = this.isPlaying ? 'waiter' : (isLeader ? 'leader' : 'player');

    if (this.isPlaying) {
      this.waiters.push(newPlayer);
      io.to(newPlayer.socket).emit("join", { roomname: this.roomname, player: playername, type: role, playerlist : this.getPlayerlist() })
    } else {
      this.players.push(newPlayer);
      this.socketToPlayers("join", { roomname: this.roomname, player: playername, type: role, playerlist : this.getPlayerlist() })
    }
    console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} joined as a ${role}.`, this.roomname, playername);
  }

  setNewLeader(): void {
    let newLeader: Player | undefined;

    if (this.players.length > 1) {
      newLeader = this.players[1];
    } else if (this.waiters.length) {
      newLeader = this.waiters[0];
    } else {
      return;
    }

    if (newLeader) {
      newLeader.isLeader = true;
      io.emit('setleader', { roomname: this.roomname, playername: newLeader.playername });
      console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} became new leader.`, this.roomname, newLeader.playername);
    }
  }

  playerDisconnect(playername: string): void {
    // TODO-if someone leave, freeze their board! 
    if (!this.players) {
      console.error(`Attempt to disconnect, currently no one in ${this.roomname}`);
      return;
    }

    const targetPlayer = this.players.find(player => player.playername === playername);
    if (!targetPlayer) {
      this.waiters = this.waiters.filter(p => p.playername !== playername);
      return;
    }

    if (targetPlayer.isLeader) this.setNewLeader();

    this.freezeIfPlaying(playername);
    this.players = this.players.filter(p => p.playername !== playername);

    this.socketToPlayers("leave", { roomname: this.roomname, player: playername, playerlist : this.getPlayerlist() });
    if (this.isPlaying) {
      this.socketToWaiters("leave", { roomname: this.roomname, player: playername, playerlist : this.getPlayerlist() });
    }
    if (this.players.length === 1 && this.isPlaying) {
      this.endgame(this.players[0].playername);
    }
    console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} left.`, this.roomname, playername);
  }

  private freezeIfPlaying(playername: string): void {
    const targetPlayer = this.players.find(player => player.playername === playername);
    if (this.isPlaying && targetPlayer && targetPlayer.isPlaying) {
      targetPlayer.Board.freezeBoard();
      targetPlayer.isPlaying = false;
    }
  }
  private socketToPlayers(event:string, data: any) {
    for (const player of this.players) {
      io.to(player.socket).emit(event, data);
    }
  }
  private socketToWaiters(event:string, data: any) {
    for (const waiter of this.waiters) {
      io.to(waiter.socket).emit(event, data);
    }
  }
  startGame(): void {
    const player = this.players[0];
    console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} began a game.`, this.roomname, player.playername);
    io.emit("startgame", { roomname: this.roomname, playerlist: this.getPlayerlist() });
    this.isPlaying = true;

    this.players.forEach(player => {
      player.isPlaying = true;
      player.Board.newPiece();
    });
  }

  endgame(winner: string): void {
    console.log(`[${c.GREEN}%s${c.RESET}] game ends.`, this.roomname);
    this.isPlaying = false;
    for (const player of this.players) {
      player.Board.freezeBoard();
    }
    if (winner) {
      this.socketToPlayers("endgame", { winner: winner, type: 'player' })
      this.socketToWaiters("endgame", { winner: winner, type: 'waiter' })
    } else {
      this.socketToPlayers("endgame", { winner: winner, type: 'solo' })
      this.socketToWaiters("endgame", { winner: winner, type: 'solo' })
    }
    io.emit('setleader', { roomname: this.roomname, playername: this.players[0].playername });
    this.players.push(...this.waiters);
    this.waiters.length = 0;

    this.key = uuidv4();
    this.players.forEach(player => {
      player.updateKey(this.key);
    });
  }

  onePlayerDied(dier: Player): void {
    this.updateBoard(dier.playername, dier.Board.fixedTiles, 'died');
    io.emit("gameover", { roomname: this.roomname, dier: dier.playername });
    console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} gameover.`, this.roomname, dier.playername);

    if (this.players.length === 1) {
      this.endgame(null);
      return;
    }

    const winner = this.players.filter(player => !player.Board.gameover);
    if (winner.length === 1) {
      winner[0].Board.freezeBoard();
      this.endgame(winner[0].playername);
    }
  }

  updateBoard(playername: string, board: any, type: string): void {
    io.emit('updateboard', { roomname: this.roomname, player: playername, board: board, type: type });
  }

  sendPenalty(sender: string, lines: number): void {
    for (const player of this.players) {
      if (player.playername === sender) continue;
      player.Board.getPenalty(lines);
    }
    console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} sent ${c.RED}%d${c.RESET} lines penalty.`, this.roomname, sender, lines);
  }

}

export default Room;
