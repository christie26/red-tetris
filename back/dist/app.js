"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
exports.isQueryParams = isQueryParams;
exports.findRoom = findRoom;
exports.findPlayer = findPlayer;
exports.checkUserUnique = checkUserUnique;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const Room_js_1 = __importDefault(require("./classes/Room.js"));
const cors_1 = __importDefault(require("cors"));
function isQueryParams(query) {
    return typeof query.room === "string" && typeof query.player === "string";
}
const playerKeyStates = {};
let rooms = [];
const c = {
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    RESET: "\x1b[0m",
};
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
});
exports.io = io;
const PORT = process.env.NODE_ENV === "test" ? 0 : process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development'; // Default to 'development' if not set
// Log environment mode
if (NODE_ENV === 'production') {
    console.log('Running in production mode :)');
}
else if (NODE_ENV === 'test') {
    console.log('Running in test mode');
}
else {
    console.log('Running in development mode');
}
// Start server if not in test environment
if (NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`red-tetris server listening on port ${PORT}`);
    });
}
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
}));
app.get("/", (req, res) => res.send("Express on Vercel"));
app.get("/redtetris.ico", (req, res) => {
    res.send();
});
app.get("/test", (req, res) => {
    res.status(200).send("This is a test endpoint!");
});
app.get("/:room/:player", (req, res) => {
    if (checkUserUnique(req.params.player, req.params.room)) {
        res.status(200).send("Good");
    }
    else {
        res.status(400).send("Player name is not unique.");
    }
});
io.on("connection", (socket) => {
    const queryParams = socket.handshake.query;
    if (!isQueryParams(queryParams)) {
        socket.emit("redirect", "/error");
        socket.disconnect();
        return;
    }
    if (!checkUserUnique(queryParams.player, queryParams.room)) {
        socket.emit("invalidName");
        return;
    }
    addUserToRoom(queryParams.room, queryParams.player, socket.id);
    socket.on("disconnect", () => {
        const room = rooms.find((room) => room.roomname === queryParams.room);
        if (room) {
            room.playerDisconnect(queryParams.player);
            if (room.players.length === 0 && room.waiters.length === 0) {
                console.log(`[${c.GREEN}%s${c.RESET}] destroyed`, room.roomname);
                rooms = rooms.filter((p) => p !== room);
            }
        }
    });
    socket.on("leaderClick", (data) => {
        const room = findRoom(socket.id);
        const player = findPlayer(socket.id);
        if (room && player && player === room.players[0]) {
            if (!room.isPlaying) {
                socket.emit("gameStarted");
                room.leaderStartGame(data.speed);
            }
        }
    });
    socket.on("keyboard", (data) => {
        const player = findPlayer(socket.id);
        if (!player || !player.isPlaying)
            return;
        if (!playerKeyStates[socket.id]) {
            playerKeyStates[socket.id] = {};
        }
        const pressedKeys = playerKeyStates[socket.id];
        if (data.type === "down") {
            if (!pressedKeys[data.key]) {
                pressedKeys[data.key] = true;
            }
            else {
                return;
            }
            if (!player.isPlaying)
                return;
            switch (data.key) {
                case "ArrowLeft":
                    player.Board.moveSide("left");
                    break;
                case "ArrowRight":
                    player.Board.moveSide("right");
                    break;
                case "ArrowDown":
                    player.Board.changeSpeedMode("fast");
                    break;
                case "ArrowUp":
                    player.Board.rotatePiece();
                    break;
                case " ":
                    player.Board.changeSpeedMode("sprint");
                    break;
            }
        }
        if (data.type === "up") {
            pressedKeys[data.key] = false;
            if (data.key === "ArrowDown") {
                player.Board.changeSpeedMode("normal");
            }
        }
    });
});
function findRoom(socketId) {
    return rooms.find((room) => room.players.find((player) => player.socket === socketId));
}
function findPlayer(socketId) {
    for (const room of rooms) {
        const player = room.players.find((player) => player.socket === socketId);
        if (player)
            return player;
    }
    return null;
}
function checkUserUnique(playername, roomname) {
    const myroom = rooms.find((room) => room.roomname === roomname);
    if (myroom) {
        const userExists = myroom.players.some((player) => player.playername === playername);
        if (userExists) {
            console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} ${c.RED} already existed.`, roomname, playername);
            return false;
        }
        else {
            console.log(`[${c.GREEN}%s${c.RESET}] ${c.YELLOW}%s${c.RESET} is unique.`, roomname, playername);
            return true;
        }
    }
    else {
        return true;
    }
}
function addUserToRoom(roomname, playername, socketId) {
    let room = rooms.find((room) => room.roomname === roomname);
    if (!room) {
        room = new Room_js_1.default(roomname);
        rooms.push(room);
    }
    room.addPlayer(playername, socketId);
}
exports.default = app;
