/*jshint esversion: 6 */

const express = require('express');
const app = express.Router();

// Import Schemas
const User = require('../models/user.js');
const Role = require('../models/roles');

app.get('/roles', (req, res) => {
    if (req.user) {
        // Check if editing specific user
        if (req.query.uid) {
            // Find user that was requested
            User.findById(req.query.uid, (err, user) => {
                if (err) return next(err);

                Role.find({}, (err, allRoles) => {
                    if (err) return next(err);
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
                        user,
                        rolesActive,
                        allRoles: allRoles
                    });
                });
            });
            // Otherwise list all users and roles
        } else {
            User.find({}, (err, users) => {
                res.render('rolesAdmin', {
                    title: 'Roles',
                    user: req.user,
                    users: users
                });
            });
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

app.post('/roles/create', (req, res) => {
    if (req.user) {
        // form takes in permissions as comma separated, potentially with leading or trailing whitespace
        var permissionsWS = req.body.permissions.split(',');
        var permissions = [];
        permissionsWS.forEach((element) => {
            permissions.push(element.trim());
        });
        console.log(permissions);
        // variable permissions is now an array of permissions with no leading or trailing whitespace
        Role.create({
            roleName: req.body.roleName,
            permissions
        });
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

// Express middleware that writes permissions to req.permissions
var checkPermissionMW = function(req, res, next) {
    var Role = require('../models/roles');
    req.user.permissions = {};
    var remaining = req.user.roles.length;
    req.user.roles.forEach(element => {
        Role.findOne({
            roleName: element
        }, (err, role) => {
            if (role && role.permissions) {
                role.permissions.forEach(permissionName => {
                    req.user.permissions[permissionName] = true;
                });
            }
            remaining --;
            if (!remaining) {
                next();
            }
        });
    });
};

module.exports = app;
module.exports.checkPermission = checkPermission;
module.exports.checkPermissionMW = checkPermissionMW;