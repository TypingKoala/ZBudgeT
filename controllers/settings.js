/*jshint esversion:6 */
const express = require('express');
const app = express.Router();
const User = require('../models/user');
var toggles = require('./toggles.json');
var featuretoggles = require('feature-toggles');
const crypto = require('crypto');
var authorize = require('../middlewares/authorize');

// Initialize Feature Toggles
featuretoggles.load(toggles);

app.get('/settings', authorize.signIn, (req, res) => {
    res.render('settings', {
        title: 'Settings',
        user: req.user,
        localLoginEnabled: featuretoggles.isFeatureEnabled('localLogin'),
        success: req.flash('success')[0],
        failure: req.flash('failure')[0]
    });
});

// POST /update
app.post('/update', authorize.signIn, (req, res, next) => {
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
});

app.get('/regenerateAPIKey', authorize.signIn, (req, res, next) => {
    // Generate new API Key
    const apiBuf = crypto.randomBytes(32);
    const apiKey = apiBuf.toString('hex');
    req.user.apiKey = apiKey
    req.user.save((err, user) => {
        if (err) return next(err);
        res.redirect('back')
    })
});

module.exports = app