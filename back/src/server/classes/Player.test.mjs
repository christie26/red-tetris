const Player = require("./Player")
const Room = require('./Room')
const socket = socket.socket
const socket2 = socket.socket

test("Player Class Test", () => {
    const room = new Room("roomname")
    const player = new Player("playername", socket, uuidv4(), false, room)
    const leader = new Player("leadername", socket2, uuidv4(), true, room) 
    
    // function to test
    // add a key
    player.updateKey()

    player.clickStartButton()
    player.gameover()
})