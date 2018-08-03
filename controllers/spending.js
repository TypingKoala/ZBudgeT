// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

app.get('/spending', (req, res) => {
    res.render('spending', {
        title: 'Spending',
        user: req.user
    });
});

module.exports = app