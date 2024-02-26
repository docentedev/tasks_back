const pool = require('./pool');

const Room = () => {
    return {
        async create(roomId) {
            const result = await pool.query('INSERT INTO rooms (room_id) VALUES ($1) RETURNING *', [roomId]);
            return result.rows[0];
        },
        async find(roomId) {
            const result = await pool.query('SELECT * FROM rooms WHERE room_id = $1', [roomId]);
            return result.rows[0];
        },
        async all() {
            const result = await pool.query('SELECT * FROM rooms');
            return result.rows;
        },
    };
}

module.exports = Room;
