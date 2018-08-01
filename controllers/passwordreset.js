const express = require('express');
const app = express.Router();
const User = require('../models/user');
const ResetReq = require('../models/resetreqs');
const fs = require('fs');
const path = require('path');

// Require Mailgun
var mailgun = require('mailgun-js')({
    apiKey: process.env.mailgunKey,
    domain: process.env.mailgunDomain
});

const crypto = require('crypto');

// Require Recaptcha Verify
const Recaptcha = require('express-recaptcha').Recaptcha;
var recaptcha = new Recaptcha(process.env.reCaptchaSiteKey, process.env.reCaptchaSecret);

app.get('/forgot', (req, res) => {
    res.render('forgot', {
        message: req.flash('failure')
    })
});

app.post('/forgot', recaptcha.middleware.verify, verifyRecaptcha, (req, res) => {
    var resetToken = crypto.randomBytes(32).toString('hex');
    User.findOneAndUpdate({
        email: req.body.email
    }, {
        resetToken: resetToken
    }, (err, newUser) => {
        // If user is found by email address:
        if (newUser) {
            var emailbody = fs.readFileSync(path.resolve(__dirname, '../resources/passwordresetemail.html'), {encoding: 'utf8'});
            emailbody = emailbody.replace('{{{resetLink}}}', `${process.env.resetAddress}/reset/${resetToken}`)
            emailbody = emailbody.replace('{{{resetLink2}}}', `${process.env.resetAddress}/reset/${resetToken}`)
            var data = {
                from: 'ZBudgeT Support <support@johnnybui.com>',
                to: req.body.email,
                subject: 'Password Reset',
                html: emailbody
            };
            mailgun.messages().send(data, function (error, body) {
                console.log(error);
                console.log(body);
            });
        }
    })
    req.flash('error', 'If that email was associated with an account, a password reset email has been sent.');
    res.redirect('/signin');
});

app.get('/reset/:resetToken', (req, res) => {
    var resetToken = req.params.resetToken;
    console.log(resetToken);
    User.findOne({
        resetToken
    }, (err, user) => {
        if (!user) {
            req.flash('failure', 'This is an invalid password reset token.');
            res.redirect('/forgot');
        } else {
            console.log('Commencing password reset for user ' + user.email)
            res.render('reset', {
                resetToken
            });
        }
    })
});

app.post('/reset/:resetToken', (req, res, next) => {
    var resetToken = req.params.resetToken;
    // Check if given resetToken is null (value assigned when no active resetToken)
    if (resetToken.length === 64) {
        if (req.body.newPassword === req.body.confirmPassword) {
            User.findOne({
                resetToken: resetToken
            }, function (err, user) {
                if (!user) {
                    req.flash('failure', 'This is an invalid password reset token.');
                    res.redirect('/forgot');
                } else {
                    user.password = req.body.newPassword;
                    user.resetToken = null;
                    user.save((err, newUser) => {
                        req.flash('success', 'Password changed successfully');
                        res.redirect('/signin');
                    });
                    
                }
            })
        } else {
            // If passwords do not match
            req.flash('failure', 'Your new passwords do not match.')
            res.redirect('/reset/' + resetToken);
        }

    } else {
        // if invalid token
        req.flash('failure', 'This is an invalid password reset token');
        res.redirect('/forgot');
    }
});

function verifyRecaptcha(req, res, next) {
    if (req.recaptcha.error) {
        res.render('forgot', {
            message: 'Please prove that you are not a robot.'
        });
    } else {
        return next();
    }
}


module.exports = app;