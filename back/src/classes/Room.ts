import Player from "./Player.js";
import { v4 as uuidv4 } from "uuid";
import { io } from "../app.js";

const c = {
  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  RESET: "\x1b[0m",
};

class Room {
  public roomname: string;
  public players: Player[] = [];
  public waiters: Player[] = [];
  public isPlaying: boolean = false;
  public key: string = uuidv4();
  public winner: string | null = null;
  score: Map<string, number> = new Map();
  speedLevel: number = 1;

  constructor(roomname: string) {
    this.roomname = roomname;
    console.log(`[${c.GREEN}%s${c.RESET}] is created`, roomname);
  }
  /* manage player's join & leave */
  addPlayer(playername: string, socketId: string): void {
    const isLeader = this.players.length === 0;
    const newPlayer = new Player(
      playername,
      socketId,
      this.key,
      isLeader,
      this,
    );
    const role = this.isPlaying ? "waiter" : isLeader ? "leader" : "player";

    if (this.isPlaying) {
      this.waiters.push(newPlayer);
      io.to(newPlayer.socket).emit("join", {
        player: playername,
        type: role,
        playerlist: this.getPlayerlist(),
        score: null,
      });
    } else {
      this.score.set(newPlayer.playername, 0);
      this.players.push(newPlayer);
      this.socketToPlayers("join", {
        player: playername,
        type: role,
        playerlist: this.getPlayerlist(),
        score: this.getScoreJson(),
      });
    }
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} joined as a ${role}.`,
      this.roomname,
      playername,
    );
  }
  playerDisconnect(playername: string): void {
    const targetPlayer = this.players.find(
      (player) => player.playername === playername,
    );
    if (targetPlayer) this.playerLeave(targetPlayer);
    else {
      const targetWaiter = this.waiters.find(
        (waiter) => waiter.playername === playername,
      );
      if (targetWaiter) this.waiterLeave(targetWaiter.playername);
      else
        console.error(
          `Attempt to disconnect, ${playername} is not in the room.`,
        );
    }
  }
  playerLeave(targetPlayer: Player): void {
    // delete score - leave
    this.score.delete(targetPlayer.playername);

    // set new leader - leave & gameover
    if (targetPlayer.isLeader) this.setNewLeader();

    // if Room is playing, ends game - leave & gameover
    if (this.isPlaying) {
      this.freezeIfPlaying(targetPlayer);
      this.checkIfGameEnd();
    }

    // remove targetPlayer from players - leave
    this.players = this.players.filter(
      (p) => p.playername !== targetPlayer.playername,
    );

    // announce & console
    this.socketToPlayers("leave", {
      player: targetPlayer.playername,
      playerlist: this.getPlayerlist(),
    });
    if (this.isPlaying)
      this.socketToWaiters("leave", {
        player: targetPlayer.playername,
        playerlist: this.getPlayerlist(),
      });
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} left.`,
      this.roomname,
      targetPlayer.playername,
    );
  }
  waiterLeave(playername: string): void {
    this.waiters = this.waiters.filter((p) => p.playername !== playername);
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} left.`,
      this.roomname,
      playername,
    );
  }

  /* start & end game */
  leaderStartGame(speed: number): void {
    for (const player of this.players) {
      if (player.Board.key !== this.key) {
        this.players[0].socket
        io.to(this.players[0].socket).emit("notReady");
        return;
      }
    }
    this.speedLevel = speed;
    for (const player of this.players) {
      player.Board.changeSpeedLevel(speed);
    }
    const player = this.players[0];
    this.socketToAll("startgame", {
      playerlist: this.getPlayerlist(),
    });
    this.isPlaying = true;

    this.players.forEach((player) => {
      player.isPlaying = true;
      player.Board.startgame();
    });
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} began a game with speed ${speed}.`,
      this.roomname,
      player.playername,
    );
  }
  playerDied(dier: Player): void {
    // update board
    this.updateBoard(dier.playername, dier.Board.fixedTiles, "died");

    // announce & console
    this.socketToAll("gameover", { dier: dier.playername });
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} gameover.`,
      this.roomname,
      dier.playername,
    );

    this.checkIfGameEnd();
  }
  checkIfGameEnd(): void {
    const winner = this.players.filter((player) => player.isPlaying);

    if (winner.length === 1) this.endgame(winner[0].playername);
    else if (this.players.length === 1) this.endgame(null);
  }
  endgame(winner: string | null): void {
    this.isPlaying = false;

    for (const player of this.players) {
      if (player.isPlaying) {
        player.Board.freezeBoard();
        player.isPlaying = false;
      }
    }

    if (winner) this.updateWinnerScore(winner);

    // announce & console
    console.log(`[${c.GREEN}%s${c.RESET}] game ends.`, this.roomname);
    this.socketToAll("endgame", { winner: winner, score: this.getScoreJson() });
    
    this.addWaitersToScore();

    // move all waiters to players
    this.players.push(...this.waiters);
    this.waiters.length = 0;

    // update a key
    this.key = uuidv4();
    this.players.forEach((player) => {
      player.updateKey(this.key);
    });
  }
  updateWinnerScore(winner: string) {
    const winnerScore = this.score.get(winner) + 1;
    this.score.set(winner, winnerScore);
  }
  addWaitersToScore() {
    for (const waiter of this.waiters) {
      this.score.set(waiter.playername, 0);
    }
  }

  /* during a game */
  updateBoard(player: string, board: any, type: string): void {
    this.socketToAll("updateboard", {
      player: player,
      board: board,
      type: type,
    });
  }
  sendPenalty(sender: string, lines: number): void {
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} sent ${c.RED}%d${c.RESET} lines penalty.`,
      this.roomname,
      sender,
      lines,
    );
    for (const player of this.players) {
      if (player.playername === sender) continue;
      if (!player.isPlaying) continue;
      console.log(
        `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} received ${c.RED}%d${c.RESET} lines penalty.`,
        this.roomname,
        player.playername,
        lines,
      );
      player.Board.recievePenalty(lines);
    }
  }

  /* utilities */
  getPlayerlist(): string[] {
    return this.players.map((player) => player.playername);
  }
  freezeIfPlaying(targetplayer: Player): void {
    if (targetplayer.isPlaying) {
      targetplayer.Board.freezeBoard();
      targetplayer.isPlaying = false;
    }
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
    newLeader.isLeader = true;
    io.to(newLeader.socket).emit("setleader", {
      playername: newLeader.playername,
    });
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} became new leader.`,
      this.roomname,
      newLeader.playername,
    );
  }
  getScoreJson(): string {
    return JSON.stringify(Array.from(this.score));
  }

  /* send socket event */
  socketToAll(event: string, data: any) {
    this.socketToPlayers(event, data);
    this.socketToWaiters(event, data);
  }
  socketToPlayers(event: string, data: any) {
    for (const player of this.players) {
      io.to(player.socket).emit(event, data);
    }
  }
  socketToWaiters(event: string, data: any) {
    for (const waiter of this.waiters) {
      io.to(waiter.socket).emit(event, data);
    }
  }
}

export default Room;
