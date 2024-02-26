const jwt = require('jsonwebtoken');

const SECRET = 'your_jwt_secret';

function getUserIdFromToken(token) {
    try {
        const decoded = jwt.verify(token, SECRET);
        return decoded.userId;
    } catch (err) {
        console.error('Error decoding token:', err);
    }
}

module.exports = getUserIdFromToken;