const express = require('express');
const app = express.Router();
const User = require('../models/user.js');
const authorize = require('../middlewares/authorize');
const request = require('request');
const Raven = require('raven');

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
        if (err) return Raven.captureException(err);
        var parsed = JSON.parse(body);
        // Overrides default joke
        if (parsed.status === 200) {
            joke = parsed.joke;
        }
        res.render('home', {
            title: 'Home',
            user: req.user,
            joke
        });
    });
});

// Export router
module.exports = app;