/*jshint esversion: 6 */
const express = require('express');
const app = express.Router();
const {
    body,
    validationResult
} = require('express-validator/check');
const {
    sanitizeBody
} = require('express-validator/filter');
const User = require('../models/user.js');
const Role = require('../models/roles');
const Raven = require('raven');
const authorize = require('../middlewares/authorize');

app.get('/users', authorize.signIn, (req, res) => {
    // Check if editing specific user and has permissions to edit
    if (req.user.permissions['users.view']) {
        User.find({}, (err, users) => {
            Role.find({}, (err, roles) => {
                res.render('usersList', {
                    title: 'List Users',
                    user: req.user,
                    users,
                    roles,
                    userEditSuccess: req.flash('userEditSuccess')[0],
                    userEditFailure: req.flash('userEditFailure')[0]
                });
            });
        });
    } else {
        // If there is no roles permission
        req.flash('error', "You don't have the necessary permissions to access this page.");
        res.redirect('/signin');
    }
});

app.post('/users/delete', authorize.signIn, [
    body('id')
        .isMongoId().withMessage('Invalid delete ID')
        .not().isEmpty().withMessage('No ID given')
], (req, res) => {
    if (!validationResult(req).isEmpty()) {
        var firstMessage = validationResult(req).array()[1].msg;
        req.flash('userEditFailure', firstMessage);
        return req.redirect('back');
    }
    User.deleteOne({
        _id: req.body.id
    }, (err) => {
        if (err) return Raven.captureException(err);
        req.flash('userEditSuccess', 'User deleted successfully!');
        res.redirect('back');
    });
});


app.post('/users/update', authorize.signIn, [
    body('id')
        .isMongoId().withMessage('Not a valid MongoID')
        .not().isEmpty().withMessage('No ID given'),
    body('newRoles')
        .isString()
        .escape()
], (req, res) => {
    // Check if userID validator failed
    if (!validationResult(req).isEmpty()) {
        req.flash('userEditFailure', validationResult(req).array()[0].msg);
        return res.redirect('back');
    }
    // form takes in permissions as comma separated, potentially with leading or trailing whitespace
    var rolesWS = req.body.newRoles.split(',');
    var roles = [];
    rolesWS.forEach((element) => {
        roles.push(element.trim());
    });
    // variable permissions is now an array of permissions with no leading or trailing whitespace
    User.updateOne({
        _id: req.body.id
    }, {
        roles
    }).catch(err => {
        Raven.setContext({
            action: 'update users',
            user: req.body.id,
            newRoles: req.body.newRoles
        });
        Raven.captureException(err);
        req.flash('userEditFailure', 'Unknown error occured when updating.');
    });
    req.flash('userEditSuccess', 'User edited successfully!');
    res.redirect('back');
});


module.exports = app;