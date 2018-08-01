const express = require('express');
const app = express.Router();

const roles = require('../models/roles');

// Require MD5 (for avatars)
const md5 = require('md5');

// Import User Schema
const User = require('../models/user.js');

app.get('/roles', (req, res) => {
    if (req.user) {
        User.find({}, (err, users) => {
            res.render('rolesAdmin', {
                title: 'Roles',
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

app.post('/roles/create', (req, res) => {
    
})


module.exports = app;