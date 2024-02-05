import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {

});

io.on("connection", (socket) => {
    path: "/" // Chemin qui est capture cote serveur 
    connectTimeout: "45000" // Number of millisecondes before disconnecting a client who has not succed to join a namespace
});

httpServer.listen(3000);