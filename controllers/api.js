const express = require('express');
const app = express.Router();

app.get('/api', (req, res) => {
    if (req.user) {
        res.send(req.user.apiKey);
    } else {
        res.send('Not signed in')
    }
})

module.exports = app;