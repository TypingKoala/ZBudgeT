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
                if (err) return next(err)
                Role.find({}, (err, allRoles) => {
                    // Create rolesActive in order to pass in dict of whether user has a certain role
                    var rolesActive = {}
                    allRoles.forEach(function(role) {
                        rolesActive[role.roleName] = user.roles.find(function(userRole) {
                            return userRole === role.roleName
                        });
                    });
                    if (err) return next(err)
                    // Render rolesEdit page
                    // Note that "user" here is the requested user, not the logged in user
                    res.render('rolesEdit', {
                        title: 'Roles',
                        user,
                        rolesActive,
                        allRoles: allRoles
                    });
                })
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
        console.log('redirecting to signin')
        res.redirect('/signin');
    }
});

app.post('/roles/create', (req, res) => {
    if (req.user) {
        // form takes in permissions as comma separated, potentially with leading or trailing whitespace
        var permissionsWS = req.body.permissions.split(',')
        var permissions = []
        permissionsWS.forEach((element) => {
            permissions.push(element.trim())
        });
        console.log(permissions);
        // variable permissions is now an array of permissions with no leading or trailing whitespace
        Role.create({
            roleName: req.body.roleName,
            permissions
        });
        res.redirect('back');
    } else {
        res.redirect('/signin')
    }
})


module.exports = app;