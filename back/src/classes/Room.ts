import Player from "./Player.js";
import { v4 as uuidv4 } from "uuid";
import io from "../app.js";

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
  speedLevel: number = 1;

  constructor(roomname: string) {
    this.roomname = roomname;
    console.log(`[${c.GREEN}%s${c.RESET}] is created`, roomname);
  }

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
        roomname: this.roomname,
        player: playername,
        type: role,
        playerlist: this.getPlayerlist(),
      });
    } else {
      this.players.push(newPlayer);
      this.socketToPlayers("join", {
        roomname: this.roomname,
        player: playername,
        type: role,
        playerlist: this.getPlayerlist(),
      });
    }
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} joined as a ${role}.`,
      this.roomname,
      playername,
    );
  }
  playerDisconnect(playername: string): void {
    if (!this.players) {
      console.error(
        `Attempt to disconnect, currently no one in ${this.roomname}`,
      );
      return;
    }
    const targetPlayer = this.players.find(
      (player) => player.playername === playername,
    );
    if (!targetPlayer) {
      this.waiters = this.waiters.filter((p) => p.playername !== playername);
      console.log(
        `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} left.`,
        this.roomname,
        playername,
      );
      return;
    }

    if (targetPlayer.isLeader) this.setNewLeader();
    this.players = this.players.filter((p) => p.playername !== playername);
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} left.`,
      this.roomname,
      playername,
    );

    this.socketToPlayers("leave", {
      roomname: this.roomname,
      player: playername,
      playerlist: this.getPlayerlist(),
    });
    if (this.isPlaying) {
      this.socketToWaiters("leave", {
        roomname: this.roomname,
        player: playername,
        playerlist: this.getPlayerlist(),
      });
      this.freezeIfPlaying(targetPlayer);
      this.checkEndgame();
    }
  }
  onePlayerDied(dier: Player): void {
    this.updateBoard(dier, dier.Board.fixedTiles, "died");
    io.emit("gameover", { roomname: this.roomname, dier: dier.playername });
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} gameover.`,
      this.roomname,
      dier.playername,
    );

    if (this.players.length === 1) {
      this.endgame(null);
      return;
    }

    this.checkEndgame();
  }
  startgame(): void {
    this.speedLevel = 1;
    const player = this.players[0];
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} began a game.`,
      this.roomname,
      player.playername,
    );
    io.emit("startgame", {
      roomname: this.roomname,
      playerlist: this.getPlayerlist(),
    });
    this.isPlaying = true;

    this.players.forEach((player) => {
      player.isPlaying = true;
      player.Board.startgame();
    });
  }
  updateBoard(player: Player, board: any, type: string): void {
    io.emit("updateboard", {
      roomname: this.roomname,
      player: player.playername,
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
      player.Board.recievePenalty(lines);
    }
  }
  changeRoomSpeed(speed: number): void {
    this.speedLevel = speed;
    for (const player of this.players) {
      player.Board.changeSpeedLevel(speed);
    }
  }
  private getPlayerlist(): string[] {
    return this.players.map((player) => player.playername);
  }
  private freezeIfPlaying(targetplayer: Player): void {
    if (targetplayer.isPlaying) {
      targetplayer.Board.freezeBoard();
      targetplayer.isPlaying = false;
    }
  }
  private checkEndgame(): void {
    const winner = this.players.filter((player) => player.isPlaying);
    if (winner.length === 1) this.endgame(winner[0].playername);
  }
  private endgame(winner: string): void {
    console.log(`[${c.GREEN}%s${c.RESET}] game ends.`, this.roomname);
    this.isPlaying = false;
    for (const player of this.players) {
      if (player.isPlaying) {
        player.Board.freezeBoard();
      }
    }
    if (winner) {
      this.socketToPlayers("endgame", { winner: winner, type: "player" });
      this.socketToWaiters("endgame", { winner: winner, type: "waiter" });
    } else {
      this.socketToPlayers("endgame", { winner: winner, type: "solo" });
      this.socketToWaiters("endgame", { winner: winner, type: "solo" });
    }
    this.players.push(...this.waiters);
    this.waiters.length = 0;
    io.emit("setleader", {
      roomname: this.roomname,
      playername: this.players[0].playername,
    });

    this.key = uuidv4();
    this.players.forEach((player) => {
      player.updateKey(this.key);
    });
  }
  private socketToPlayers(event: string, data: any) {
    for (const player of this.players) {
      io.to(player.socket).emit(event, data);
    }
  }
  private socketToWaiters(event: string, data: any) {
    for (const waiter of this.waiters) {
      io.to(waiter.socket).emit(event, data);
    }
  }
  private setNewLeader(): void {
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
      roomname: this.roomname,
      playername: newLeader.playername,
    });
    console.log(
      `[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} became new leader.`,
      this.roomname,
      newLeader.playername,
    );
  }
}

export default Room;
