const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'socket_io_app',
    password: '',
    port: 5432,
});

module.exports = pool;