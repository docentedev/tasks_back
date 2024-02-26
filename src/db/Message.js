const pool = require('./pool');

const Message = () => {
    return {
        async create(roomId, userId, message) {
            const result = await pool.query('INSERT INTO messages (room_id, user_id, message) VALUES ($1, $2, $3) RETURNING *', [roomId, userId, message]);
            return result.rows[0];
        },
        // by id inner join users on messages.user_id = users.id
        async findById(id) {
            const result = await pool.query('SELECT messages.*, users.username FROM messages JOIN users ON messages.user_id = users.id WHERE messages.id = $1', [id]);
            return result.rows[0];
        },
        async find(roomId) {
            const result = await pool.query('SELECT messages.*, users.username FROM messages JOIN users ON messages.user_id = users.id WHERE room_id = $1', [roomId]);
            return result.rows;
        },
        async clear(roomId) {
            await pool.query('DELETE FROM messages WHERE room_id = $1', [roomId]);
        },
    };
}

module.exports = Message;
