"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Player_js_1 = __importDefault(require("./Player.js"));
const uuid_1 = require("uuid");
const app_js_1 = require("../app.js");
const c = {
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    RESET: "\x1b[0m",
};
class Room {
    roomname;
    players = [];
    waiters = [];
    isPlaying = false;
    key = (0, uuid_1.v4)();
    winner = null;
    score = new Map();
    speedLevel = 1;
    constructor(roomname) {
        this.roomname = roomname;
        console.log(`[${c.GREEN}%s${c.RESET}] is created`, roomname);
    }
    /* manage player's join & leave */
    addPlayer(playername, socketId) {
        const isLeader = this.players.length === 0;
        const newPlayer = new Player_js_1.default(playername, socketId, this.key, isLeader, this);
        const role = this.isPlaying ? "waiter" : isLeader ? "leader" : "player";
        if (this.isPlaying) {
            this.waiters.push(newPlayer);
            app_js_1.io.to(newPlayer.socket).emit("join", {
                player: playername,
                type: role,
                playerlist: this.getPlayerlist(),
                score: null,
            });
        }
        else {
            this.score.set(newPlayer.playername, 0);
            this.players.push(newPlayer);
            this.socketToPlayers("join", {
                player: playername,
                type: role,
                playerlist: this.getPlayerlist(),
                score: this.getScoreJson(),
            });
        }
        console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} joined as a ${role}.`, this.roomname, playername);
    }
    playerDisconnect(playername) {
        const targetPlayer = this.players.find((player) => player.playername === playername);
        if (targetPlayer)
            this.playerLeave(targetPlayer);
        else {
            const targetWaiter = this.waiters.find((waiter) => waiter.playername === playername);
            if (targetWaiter)
                this.waiterLeave(targetWaiter.playername);
            else
                console.error(`Attempt to disconnect, ${playername} is not in the room.`);
        }
    }
    playerLeave(targetPlayer) {
        // delete score - leave
        this.score.delete(targetPlayer.playername);
        // set new leader - leave & gameover
        if (targetPlayer.isLeader)
            this.setNewLeader();
        // if Room is playing, ends game - leave & gameover
        if (this.isPlaying) {
            if (targetPlayer.isPlaying) {
                targetPlayer.isPlaying = false;
                targetPlayer.Board.freezeBoard();
            }
            this.checkIfGameEnd();
        }
        // remove targetPlayer from players - leave
        this.players = this.players.filter((p) => p.playername !== targetPlayer.playername);
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
        console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} left.`, this.roomname, targetPlayer.playername);
    }
    waiterLeave(playername) {
        this.waiters = this.waiters.filter((p) => p.playername !== playername);
        console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} left.`, this.roomname, playername);
    }
    /* start & end game */
    leaderStartGame(speed) {
        for (const player of this.players) {
            if (player.Board.key !== this.key) {
                this.players[0].socket;
                app_js_1.io.to(this.players[0].socket).emit("notReady");
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
        console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} began a game with speed ${speed}.`, this.roomname, player.playername);
    }
    playerDied(dier) {
        // update board
        this.updateBoard(dier.playername, dier.Board.fixedTiles, "died");
        // announce & console
        this.socketToAll("gameover", { dier: dier.playername });
        console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} gameover.`, this.roomname, dier.playername);
        this.checkIfGameEnd();
    }
    checkIfGameEnd() {
        const winner = this.players.filter((player) => player.isPlaying);
        if (winner.length === 1)
            this.endgame(winner[0].playername);
        else if (this.players.length === 1)
            this.endgame(null);
    }
    endgame(winner) {
        this.isPlaying = false;
        for (const player of this.players) {
            if (player.isPlaying) {
                player.isPlaying = false;
                player.Board.freezeBoard();
            }
        }
        if (winner)
            this.updateWinnerScore(winner);
        // announce & console
        console.log(`[${c.GREEN}%s${c.RESET}] game ends.`, this.roomname);
        this.socketToAll("endgame", { winner: winner, score: this.getScoreJson() });
        this.addWaitersToScore();
        // move all waiters to players
        this.players.push(...this.waiters);
        this.waiters.length = 0;
        // update a key
        this.key = (0, uuid_1.v4)();
        this.players.forEach((player) => {
            player.updateKey(this.key);
        });
    }
    updateWinnerScore(winner) {
        const winnerScore = this.score.get(winner) + 1;
        this.score.set(winner, winnerScore);
    }
    addWaitersToScore() {
        for (const waiter of this.waiters) {
            this.score.set(waiter.playername, 0);
        }
    }
    /* during a game */
    updateBoard(player, board, type) {
        this.socketToAll("updateboard", {
            player: player,
            board: board,
            type: type,
        });
    }
    sendPenalty(sender, lines) {
        console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} sent ${c.RED}%d${c.RESET} lines penalty.`, this.roomname, sender, lines);
        for (const player of this.players) {
            if (player.playername === sender)
                continue;
            if (!player.isPlaying)
                continue;
            console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} received ${c.RED}%d${c.RESET} lines penalty.`, this.roomname, player.playername, lines);
            player.Board.recievePenalty(lines);
        }
    }
    /* utilities */
    getPlayerlist() {
        return this.players.map((player) => player.playername);
    }
    setNewLeader() {
        let newLeader;
        if (this.players.length > 1) {
            newLeader = this.players[1];
        }
        else if (this.waiters.length) {
            newLeader = this.waiters[0];
        }
        else {
            return;
        }
        newLeader.isLeader = true;
        app_js_1.io.to(newLeader.socket).emit("setleader", {
            playername: newLeader.playername,
        });
        console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} became new leader.`, this.roomname, newLeader.playername);
    }
    getScoreJson() {
        return JSON.stringify(Array.from(this.score));
    }
    /* send socket event */
    socketToAll(event, data) {
        this.socketToPlayers(event, data);
        this.socketToWaiters(event, data);
    }
    socketToPlayers(event, data) {
        for (const player of this.players) {
            app_js_1.io.to(player.socket).emit(event, data);
        }
    }
    socketToWaiters(event, data) {
        for (const waiter of this.waiters) {
            app_js_1.io.to(waiter.socket).emit(event, data);
        }
    }
}
exports.default = Room;
