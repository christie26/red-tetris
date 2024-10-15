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
    console.log(`${c.GREEN}%s${c.RESET} is created`, roomname);
  }

  getPlayerlist(): string[] {
    return this.players.map(player => player.playername);
  }

  addPlayer(playername: string, socketId: string): void {
    const isLeader = this.players.length === 0;
    const newPlayer = new Player(playername, socketId, this.key, isLeader, this);

    if (this.isPlaying) {
      this.waiters.push(newPlayer);
    } else {
      this.players.push(newPlayer);
    }
    const role = this.isPlaying ? 'waiter' : (isLeader ? 'leader' : 'player');
    io.emit("join", { roomname: this.roomname, player: playername, type: role });
    console.log(`${c.YELLOW}%s${c.RESET} joined ${c.GREEN}%s${c.RESET} as a ${role}.`, playername, this.roomname);

    // to everyone
    io.emit('playerlist', {roomname: this.roomname, playerlist : this.getPlayerlist()});
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
      io.emit('newleader', { roomname: this.roomname, playername: newLeader.playername });
      console.log(`${c.YELLOW}%s${c.RESET} became new leader.`, newLeader.playername);
    }
  }

  playerDisconnect(playername: string): void {
    if (!this.players) {
      console.error(`Attempt to disconnect, no player in ${this.roomname}`);
      return;
    }

    const targetPlayer = this.players.find(player => player.playername === playername);
    if (!targetPlayer) {
      this.waiters = this.waiters.filter(p => p.playername !== playername);
      return;
    }

    if (targetPlayer.isLeader) {
      this.setNewLeader();
    }

    this.freezeIfPlaying(playername);
    this.players = this.players.filter(p => p.playername !== playername);

    if (this.players.length === 1 && this.isPlaying) {
      this.endgame(this.players[0].playername);
    }

    io.emit("leave", { roomname: this.roomname, player: playername });
    // to everyone
    io.emit('playerlist', {roomname: this.roomname, playerlist : this.getPlayerlist()});
    console.log(`${c.YELLOW}%s${c.RESET} left from ${c.GREEN}%s${c.RESET}.`, playername, this.roomname);
  }

  private freezeIfPlaying(playername: string): void {
    const targetPlayer = this.players.find(player => player.playername === playername);
    if (this.isPlaying && targetPlayer && targetPlayer.isPlaying) {
      targetPlayer.Board.freezeBoard();
      targetPlayer.isPlaying = false;
    }
  }

  startGame(): void {
    const player = this.players[0];
    console.log(`${c.YELLOW}%s${c.RESET} began a game.`, player.playername);
    io.emit("startgame", { roomname: this.roomname, playerlist: this.getPlayerlist() });
    this.isPlaying = true;

    this.players.forEach(player => {
      player.isPlaying = true;
      player.Board.newPiece();
    });
  }

  endgame(winner: string): void {
    this.isPlaying = false;
    for (const player of this.players) {
      player.Board.freezeBoard();
    }
    io.emit("endgame", { roomname: this.roomname, winner: winner, type: 'player' });
    io.emit("endgame", { roomname: this.roomname, winner: winner, type: 'waiter' });
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
    console.log(`${c.YELLOW}%s${c.RESET} gameover in ${c.GREEN}%s${c.RESET}.`, dier.playername, this.roomname);

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
    console.log(`${c.YELLOW}%s${c.RESET} sent ${c.RED}%d${c.RESET} lines penalty in ${c.GREEN}%s${c.RESET}.`, sender, lines, this.roomname);
  }

  private createBoard() {
    // Implement this method to return the board structure required for each player
    return {
      freezeBoard: () => {},
      newPiece: () => {},
      getPenalty: (lines: number) => {},
      gameover: false,
      fixedTiles: [],
    };
  }
}

export default Room;
