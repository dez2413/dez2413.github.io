const express = require('express');
const app = express();
//socket.io server
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
    });

    const players = {
        white: null,
        black: null,
    };

    io.on('connection', (socket) => {
        console.log(`A user connected: ${socket.id}`);
    
        // Assign the player to "white" or "black"
        if (!players.white) {
            players.white = socket.id;
            socket.emit('playerColor', 'white');
        } else if (!players.black) {
            players.black = socket.id;
            socket.emit('playerColor', 'black');
        } else {
            socket.emit('spectator');
        }
    
        io.emit('playerUpdate', players);
        console.log(players);
    
        // Handle piece movement
        socket.on('movePiece', (moveData) => {
            io.emit('pieceMoved', moveData);
        });
    
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
    
            if (players.white === socket.id) players.white = null;
            if (players.black === socket.id) players.black = null;
    
            io.emit('playerUpdate', players);
            console.log(players);
        });
    });

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    });

    console.log("server is running");