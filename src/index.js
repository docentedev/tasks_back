const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// helloworld
server.get('/', (req, res) => {
    res.send('Hello World');
});

server.listen(3000, () => {
    console.log('Escuchando en el puerto 3000');
});