import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import express from 'express';

import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
const httpServer = createServer(app);

const io = new Server(httpServer);

app.use(express.static(path.join(__dirname, '../client')));

io.on("connection", (socket) => {
   console.log("un client est connecte");
});

httpServer.listen(port, () => {
    console.log("Serveur lance sur", port);
});