const express = require('express');
const app = express.Router();
const User = require('../models/user.js');
const authorize = require('../middlewares/authorize');

// GET /
app.get('/', authorize.signIn, (req, res, next) => {
    User.find({}, (err, users) => {
        res.render('home', {
            title: 'Home',
            user: req.user
        });
    });
});

// Export router
module.exports = app;