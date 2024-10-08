const Board = require('./Board');
const socket = socket.socket
const Player = require('./Player');
const Room = require('./Room')

test('Board Class Test ', () => {
    const room = new Room("roomname")
    const player = new Player("playername", socket, uuidv4(), false, room)
    const board = new Board(player.socket, player.key, player)

    // function to test
    board.newPiece()

    // add a tiles
    board.isFree()

    // add a tempTiles
    board.touchBorder()
    board.touchOtherPiece()

    board.renderPiece()
    board.renderFixedPiece()
    board.isLineFull()
    board.clearLines()
    board.getPenalty()
    board.freezeBoard()
    board.dropLocation()
})