const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
    const room = 'some room';
    socket.join(room);

    socket.on('message', (message) => {
        io.to(room).emit('message', message);
    });

    socket.on('disconnect', () => {
        socket.leave(room);
        if (io.sockets.adapter.rooms[room] === undefined) {
            console.log('La sala está vacía. Cerrando la sesión.');
            // Aquí puedes implementar la lógica para cerrar la sesión
        }
    });
});

server.listen(3000, () => {
    console.log('Escuchando en el puerto 3000');
});