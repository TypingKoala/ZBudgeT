/*jshint esversion: 6 */
const express = require('express');
const app = express.Router();

// Validation and Sanitation
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Import Schemas
const User = require('../models/user.js');
const Role = require('../models/roles');

const Raven = require('raven');

app.get('/roles', (req, res) => {
    if (req.user) {
        // Check if editing specific user and has permissions to edit
        if (req.query.uid && req.user.permissions['roles.edit']) {
            // Find user that was requested
            renderUserEditPage(req, res);
            // Otherwise list all users and roles
        } else if (req.user.permissions['roles.view']) {
            renderUserListPage(res, req);
        } else {
            // If there is no roles permission
            req.flash('error', "You don't have the necessary permissions to access this page.");
            res.redirect('/signin');
        }
    } else {
        console.log('redirecting to signin');
        res.redirect('/signin');
    }
});

app.get('/roles/edit', (req, res, next) => {
    if (req.user) {
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
    } else {
        res.redirect('/signin');
    }
});

app.post('/roles/create', [
    body('permissions')
        .isString()
        .escape(),
    body('roleName')
        .isString()
        .escape()
        .custom(value => {
            return Role.findOne({roleName: value}).then(role => {
                if (role) return Promise.reject('That role name has already been taken.');
            });
        })
], (req, res) => {
    if (req.user) {
        // Check if roleName validator failed
        if (!validationResult(req).isEmpty()) {
            req.flash('failure', validationResult(req).array()[0].msg);
            return res.redirect('back');
        }
        // form takes in permissions as comma separated, potentially with leading or trailing whitespace
        var permissionsWS = req.body.permissions.split(',');
        var permissions = [];
        permissionsWS.forEach((element) => {
            permissions.push(element.trim());
        });
        // variable permissions is now an array of permissions with no leading or trailing whitespace
        Role.create({
            roleName: req.body.roleName,
            permissions
        }).catch(err => Raven.captureException(err));
        res.redirect('back');
    } else {
        res.redirect('/signin');
    }
});


/**
 * This promise resolves a boolean based on whether the user 
 * has a given permission
 * @param {object} user - a Mongoose document representing the user to be checked
 * @param {string} permission - the permission to check against
 */
var checkPermission = function(user, permission) {
    return new Promise((resolve, reject) => {
        var Role = require('../models/roles');
        var remaining = user.roles.length;
        user.roles.forEach(element => {
            Role.findOne({
                roleName: element
            }, (err, role) => {
                if (role && role.permissions.indexOf(permission) >= 0) {
                    resolve(true);
                }
                remaining --;
                if (!remaining) {
                    resolve(false);
                }
            });
        });
    });
};

module.exports = app;
module.exports.checkPermission = checkPermission;

function renderUserListPage(res, req) {
    User.find({}, (err, users) => {
        Role.find({}, (err, roles) => {
            res.render('rolesAdmin', {
                title: 'Roles',
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
            // Render rolesEdit page
            // Note that "user" here is the requested user, not the logged in user
            res.render('rolesEdit', {
                title: 'Roles',
                user: req.user,
                userEdit: user,
                rolesActive,
                allRoles: allRoles,
                failureMessage: req.flash('failure')[0]
            });
        });
    });
}
