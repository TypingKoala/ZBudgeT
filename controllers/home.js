/* jshint esversion: 6*/
const express = require('express');
const app = express.Router();
const User = require('../models/user.js');
const authorize = require('../middlewares/authorize');
const request = require('request');

// GET /
app.get('/', authorize.signIn, (req, res, next) => {
    // Set options for the icanhazdadjoke API Request
    options = {
        url: 'https://icanhazdadjoke.com/',
        headers: {
            Accept: 'application/json'
        }
    };

    // Send request to the icanhazdadjoke API
    var joke = "My dog used to chase people on a bike a lot. It got so bad I had to take his bike away.";
    request(options, (err, response, body) => {
        var parsed = JSON.parse(body);
        // Overrides default joke
        if (parsed.status === 200) {
            joke = parsed.joke;
        }
        res.render('home', {
            title: 'Home',
            user: req.user,
            joke,
            error: req.flash('error')[0]
        });
    });
});

// Export router
module.exports = app;