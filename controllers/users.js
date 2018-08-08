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
    if (req.query.uid && req.user.permissions['users.edit']) {
        // Find user that was requested
        renderUserEditPage(req, res);
        // Otherwise list all users and roles
    } else if (req.user.permissions['users.view']) {
        renderUserListPage(res, req);
    } else {
        // If there is no roles permission
        req.flash('error', "You don't have the necessary permissions to access this page.");
        res.redirect('/signin');
    }
});

app.get('/users/edit', authorize.signIn, (req, res, next) => {
    if (req.query.uid && req.query.roleName) {
        User.findById(req.query.uid, (err, user) => {
            if (err) return next(err);

            if (user.roles.includes(req.query.roleName)) {
                var index = user.roles.indexOf(req.query.roleName);
                user.roles.splice(index, 1);
            } else {
                user.roles.push(req.query.roleName);
            }
            user.save();
            res.redirect('back');
        });
    } else {
        res.redirect('back');
    }
});

function renderUserListPage(res, req) {
    User.find({}, (err, users) => {
        Role.find({}, (err, roles) => {
            res.render('usersList', {
                title: 'List Users',
                user: req.user,
                users,
                roles
            });
        });
    });
}

function renderUserEditPage(req, res) {
    User.findById(req.query.uid, (err, user) => {
        if (err)
            return next(err);
        Role.find({}, (err, allRoles) => {
            if (err)
                return next(err);
            // Create rolesActive in order to pass in dict of whether user has a certain role
            var rolesActive = {};
            allRoles.forEach(function (role) {
                rolesActive[role.roleName] = user.roles.find(function (userRole) {
                    return userRole === role.roleName;
                });
            });
            // Render usersEdit page
            // Note that "user" here is the requested user, not the logged in user
            res.render('usersEdit', {
                title: 'User Edit',
                user: req.user,
                userEdit: user,
                rolesActive,
                allRoles: allRoles,
                failureMessage: req.flash('failure')[0]
            });
        });
    });
}


module.exports = app;