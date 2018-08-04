// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

app.get('/reports', (req, res) => {
    if (req.user) {
        res.render('reports', {
            title: 'Reports',
            user: req.user
        })
    }
})


module.exports = app