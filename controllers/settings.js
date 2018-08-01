// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

// Require MD5 (for avatars)
const md5 = require('md5');

// Require User Model
const User = require('../models/user');

// Initialize toggles
var toggles = require('./toggles.json');
var featuretoggles = require('feature-toggles');
featuretoggles.load(toggles);

    

app.get('/settings', (req, res) => {
    if (req.user) {
        res.render('settings', {
            title: 'Settings',
            name: req.user.name,
            roles: req.user.roles,
            avatarMD5: md5(req.user.email),
            apiKey: req.user.apiKey,
            localLoginEnabled: featuretoggles.isFeatureEnabled('localLogin'),
            success: req.flash('success')[0],
            failure: req.flash('failure')[0]
        });
    } else {
        res.redirect('/signin');
    }
});

// POST /update
app.post('/update', (req, res, next) => {
    if (req.user) {
        User.authenticate(req.user.email, req.body.password, function (err, user) {
            if (err) {
                req.flash('failure', 'Please make sure you enter your current password correctly.');
                res.redirect('/settings');
            } else {
                if (req.body.newPassword === req.body.confirmPassword) {
                    req.user.password = req.body.newPassword;
                    req.user.save((err, updatedUser) => {
                        if (err) return next(err);
                        req.flash('success', 'Password changed successfully');
                        res.redirect('/settings');
                    })
                } else {
                    req.flash('failure', 'Your new passwords do not match.')
                    res.redirect('/settings')
                }
            }

        })
    } else {
        res.send('Not logged in.')
    }
});

module.exports = app