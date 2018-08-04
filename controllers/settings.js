// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

// Require User Model
const User = require('../models/user');

// Initialize toggles
var toggles = require('./toggles.json');
var featuretoggles = require('feature-toggles');
featuretoggles.load(toggles);

// Initialize Crypto
const crypto = require('crypto')


app.get('/settings', (req, res) => {
    if (req.user) {
        res.render('settings', {
            title: 'Settings',
            user: req.user,
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

app.get('/regenerateAPIKey', (req, res, next) => {
    if (req.user) {
        // Generate new API Key
        const apiBuf = crypto.randomBytes(32);
        const apiKey = apiBuf.toString('hex');
        req.user.apiKey = apiKey
        req.user.save((err, user) => {
            if (err) return next(err);
            res.redirect('back')
        })
    } else {
        res.redirect('/signin')
    }
});

module.exports = app