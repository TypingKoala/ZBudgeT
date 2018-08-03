// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

app.get('/budgets', (req, res) => {
    res.render('budgets', {
        title: 'Budgets',
        user: req.user
    });
});

module.exports = app