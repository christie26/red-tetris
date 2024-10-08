const Room = require('./Room')
const socket = socket.socket

test("Room Class Test", () => {
    const room = new Room("roomname")

    // function to test
    // add playername and socket
    room.addPlayer("playername", socket)
    // add playername to remove
    room.removePlayer("playername")
    room.targetIsPlaying("playername")

    room.startGame()

    // add a winner (as string)
    room.endGame()

    // add a winner (as string)
    room.updateEndgameToPlayer()
    room.updateEngameToWaiters()

    // add a dier (as a Player Object)
    room.onePlayerDied()

    // add playername, board, type
    room.updateBoard()

    // add a sender (as a string) and nblines 
    room.sendPenalty()

})