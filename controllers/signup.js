// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

// Initialize Crypto
const crypto = require('crypto');

// Import User Schema
const User = require('../models/user.js');

// Initialize toggles
var toggles = require('./toggles.json');
var featuretoggles = require('feature-toggles');
featuretoggles.load(toggles);


// Activate Signup Flow if Feature Toggle Enabled
if (featuretoggles.isFeatureEnabled('signup')) {
    // GET /signup
    app.get('/signup', (req, res) => {
        res.render('signup');
    });

    // POST /signup
    app.post('/signup', (req, res, next) => {
        if (req.body.name && req.body.email && req.body.password && req.body.confirmPassword) {
            if (req.body.password == req.body.confirmPassword) {
                // Generate API Key
                const apiBuf = crypto.randomBytes(32);
                const apiKey = apiBuf.toString('hex');
                var newUserData = {
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    apiKey
                };
                User.create(newUserData, (err, user) => {
                    if (err) {
                        next(err);
                    } else {
                        var user = User.findOne({
                            email: req.body.email
                        }, (err, user) => {
                            req.login(user, function (err) {
                                if (err) return next(err);
                                res.redirect('/');
                            })
                        });
                    }
                });

            } else {
                var err = new Error('Passwords do not match');
                next(err);
            }
        } else {
            var err = new Error('All fields are required');
            next(err);
        }
    });
}



module.exports = app;