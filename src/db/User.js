const bcrypt = require('bcrypt');
const pool = require('./pool');

const User = () => {
    return {
        async create(username, password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);
            return result.rows[0];
        },
        async findByUsername(username) {
            const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            return result.rows[0];
        },
    };
}

module.exports = User;
