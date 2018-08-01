// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

// Require MD5 (for avatars)
const md5 = require('md5');

// Import User Schema
const User = require('../models/user.js');

// GET /
app.get('/', (req, res, next) => {
    if (req.user) {
        User.find({}, (err, users) => {
            res.render('rolesAdmin', {
                title: 'Home',
                name: req.user.name,
                roles: req.user.roles,
                avatarMD5: md5(req.user.email),
                users: users
            });
        });
    } else {
        console.log('redirecting to signin')
        res.redirect('/signin');
    }
});

// Export router
module.exports = app;