const Piece = require('./Piece');
const Tile = require('./Tile');
const Board = require('./Board')
const socket = socket.socket
const Player = require('./Player');
const Room = require('./Room')

test('Piece Class Test ', () => {
    let type = Math.floor(this.createRandom() * 7);
    let left = 3 + Math.floor(this.createRandom() * 4);
    let direction = Math.floor(this.createRandom() * 4);

    const room = new Room("roomname")
    const player = new Player("playername", socket, uuidv4(), false, room)
    const board = new Board(player.socket, player.key, player)
    const piece = new Piece(board, type, left, direction)

    // function to test
    // add position x and y
    piece.addTitle()
    // add a Tiles
    piece.dupTiles()
    // add a Tiles and direction
    piece.moveTiles()
    // add a Tiles
    piece.rotateTiles()
    // add direction
    piece.moveSide()

    piece.moveDown()
    piece.rotatePiece()

    // add tempTiles and direction
    piece.tryMoveDirection

    piece.fixPiece()
    piece.fallSprint()
    piece.fasterSpeed()
    piece.resetSpeed()
    piece.stopPiece()
    piece.checkFloating()
})
