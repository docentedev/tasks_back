const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../db/User');
const SECRET = 'your_jwt_secret';

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const userDb = User();
        await userDb.create(username, password);
        const user = await userDb.findByUsername(username);

        if (!user) {
            return res.status(400).send({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user.id }, SECRET);
        res.json({ token });

    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'Username already exists' });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const userDb = User();
        const user = await userDb.findByUsername(username);

        if (!user) {
            return res.status(400).send({ error: 'Invalid username or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).send({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user.id }, SECRET);
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Server error' });
    }
});

module.exports = router;