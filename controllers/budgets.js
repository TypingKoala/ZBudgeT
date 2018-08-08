/* jshint esversion:6 */
// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

const authorize = require('../middlewares/authorize'); // Require Authorize Middleware

app.get('/budgets', authorize.signIn, (req, res) => {
    res.render('budgets', {
        title: 'Budgets',
        user: req.user
    });
});

module.exports = app;