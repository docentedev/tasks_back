const express = require('express');

const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-streams-adapter');
const { createClient } = require('redis');

const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const getUserIdFromToken = require('./routes/getUserIdFromToken');

const Room = require('./db/Room');
const Message = require('./db/Message');

const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.use(authRoutes);
const PORT = process.env.PORT || 1337;
const server = app.listen(1337, () => console.log(`Server is running on port ${PORT}`));

const redisClient = createClient({ url: "redis://localhost:6379" });
const redisClientConnect = redisClient.connect();

const eventListeners = {
    CONNECTION: 'connection',
    GET_ROOMS: 'getRooms',
    JOIN_ROOM: 'joinRoom',
    MESSAGE: 'message',
    CLEAR_MESSAGES: 'clearMessages',
    DISCONNECT: 'disconnect',
};
const eventsDispatch = {
    OLD_MESSAGES: 'oldMessages',
    USER_JOINED: 'userJoined',
    USER_LEFT: 'userLeft',
    CLEAR_MESSAGES: 'clearMessages',
    MESSAGE: 'message',
    ROOMS: 'rooms',
};

Promise.all([redisClientConnect]).then(() => {
    console.log('Redis is ready');
    const io = new Server(server, {
        adapter: createAdapter(redisClient)
    });

    io.on('error', (err) => {
        console.log('io error', err);
    });
    socketListeners(io);
});

const socketListeners = (io) => {
    io.on(eventListeners.CONNECTION, (socket) => {
        console.log('a user connected');
        const token = socket.handshake.auth.token;
        if (!token) {
            console.log('no token');
            socket.disconnect();
            return;
        }
        const userId = getUserIdFromToken(token);

        console.log('userId', userId);
        if (userId) {
            socket.userId = userId;
        } else {
            socket.disconnect();
            return;
        }

        socket.on(eventListeners.GET_ROOMS, async () => {
            const roomDb = Room();
            const res = await roomDb.all();
            socket.emit(eventsDispatch.ROOMS, res);
        });

        socket.on(eventListeners.JOIN_ROOM, async (roomId) => {
            const roomDb = Room();
            const roomRes = await roomDb.find(roomId);
            if (!roomRes) {
                await roomDb.create(roomId);
            }
            socket.join(roomId);
            const messageDb = Message();
            const res = await messageDb.find(roomId);
            socket.emit(eventsDispatch.OLD_MESSAGES, res);
            const resRoom = await roomDb.all();
            // emit all rooms to all clients
            io.emit(eventsDispatch.ROOMS, resRoom);
            socket.to(roomId).emit(eventsDispatch.USER_JOINED, socket.userId);
        });

        socket.on(eventListeners.MESSAGE, async (roomId, message) => {
            const messageDb = Message();
            console.log('roomId', roomId, 'message', message, 'userId', socket.userId);
            const msg = await messageDb.create(roomId, socket.userId, message);
            console.log('message created', msg);
            const res = await messageDb.findById(msg.id);
            console.log('message found', res);
            io.to(roomId).emit(eventsDispatch.MESSAGE, res);
        });

        socket.on(eventListeners.CLEAR_MESSAGES, async (roomId) => {
            const messageDb = Message();
            await messageDb.clear(roomId);
            io.to(roomId).emit(eventsDispatch.CLEAR_MESSAGES);
        });

        socket.on(eventListeners.DISCONNECT, () => {
            const rooms = Object.keys(socket.rooms);
            rooms.forEach(async (roomId) => {
                if (roomId !== socket.id) {
                    socket.to(roomId).emit(eventsDispatch.USER_LEFT, socket.userId);
                }
                socket.leave(roomId);
            });
        });
    });
}    