// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

// Require Recaptcha Verify
const Recaptcha = require('express-recaptcha').Recaptcha;
var recaptcha = new Recaptcha(process.env.reCaptchaSiteKey, process.env.reCaptchaSecret);

// Initialize Passport.js
var passport = require('passport');

// Initialize toggles
var toggles = require('./toggles.json');
var featuretoggles = require('feature-toggles');
featuretoggles.load(toggles);

// GET /signin
app.get('/signin', (req, res) => {
    res.render('signin', {
        message: req.flash('error'),
        mitLoginEnabled: featuretoggles.isFeatureEnabled('mitLogin'),
        localLoginEnabled: featuretoggles.isFeatureEnabled('localLogin')
    });
});

// POST /signin with Passport.js Local
if (featuretoggles.isFeatureEnabled('localLogin')) {
    app.post('/signin', recaptcha.middleware.verify, verifyRecaptcha, passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/signin',
        failureFlash: 'Incorrect username and password.',
        session: true
    }));
}

// MIT OIDC endpoint and callback url
if (featuretoggles.isFeatureEnabled('mitLogin')) {
    // oidc request
    app.get('/auth', passport.authenticate('oidc'));

    // oidc authentication callback
    app.get('/oidc', passport.authenticate('oidc', {
        successRedirect: '/',
        failureRedirect: '/signin',
        failureFlash: 'Authentication failed.'
    }));
}

function verifyRecaptcha(req, res, next) {
    if (req.recaptcha.error) {
        res.render('signin', {
            message: 'Please prove that you are not a robot.'
        });
    } else {
        return next();
    }
}


module.exports = app;