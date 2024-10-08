const Board = require('./Board');
const socket = socket.socket
const Player = require('./Player');
import Room from './Room.mjs';

test('Board test ', () => {
    const room = new Room("roomname")
    const player = new Player("playername", socket, uuidv4(), false, room)
    const board = new Board(player.socket, player.key, player)

    // function to test
    
    board.newPiece()
    board.isFree()
})