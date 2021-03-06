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
const authorize = require('../middlewares/authorize');

app.get('/roles', authorize.signIn, authorize.checkAccessMW('global.roles.view'), (req, res) => {
    User.find({}, (err, users) => {
        Role.find({}, (err, roles) => {
            res.render('rolesList', {
                title: 'Roles',
                user: req.user,
                users,
                roles,
                roleCreateFailure: req.flash('roleCreateFailure')[0],
                roleEditFailure: req.flash('roleEditFailure')[0],
                roleCreateSuccess: req.flash('roleCreateSuccess')[0],
                roleEditSuccess: req.flash('roleEditSuccess')[0]
            });
        });
    });
});


app.post('/roles/delete', authorize.signIn, authorize.checkAccessMW('global.roles.edit'), [
    body('id')
    .isMongoId().withMessage('Invalid delete ID')
    .not().isEmpty().withMessage('No ID given')
], (req, res, next) => {
    if (!validationResult(req).isEmpty()) {
        var firstMessage = validationResult(req).array()[1].msg;
        req.flash('roleEditFailure', firstMessage);
        return req.redirect('back');
    }
    Role.deleteOne({
        _id: req.body.id
    }, (err) => {
        req.flash('roleEditSuccess', 'Role deleted successfully!');
        res.redirect('back');
    });
});

app.post('/roles/create', authorize.checkAccessMW('global.roles.edit'), [
    body('permissions')
    .isString()
    .escape(),
    body('roleName')
    .isString()
    .escape()
    .custom(value => {
        return Role.findOne({
            roleName: value
        }).then(role => {
            if (role) return Promise.reject('That role name has already been taken.');
        });
    })
], authorize.signIn, (req, res) => {
    // Check if roleName validator failed
    if (!validationResult(req).isEmpty()) {
        req.flash('roleCreateFailure', validationResult(req).array()[0].msg);
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
    }).catch(err => console.log(err));
    req.flash('roleCreateSuccess', 'Role successfully created!');
    res.redirect('back');
});

app.post('/roles/update', authorize.checkAccessMW('global.roles.edit'), [
    body('id')
    .isMongoId().withMessage('Not a valid MongoID')
    .not().isEmpty().withMessage('No ID given'),
    body('newPermissions')
    .isString()
    .escape()
], authorize.signIn, (req, res) => {
    // Check if roleName validator failed
    if (!validationResult(req).isEmpty()) {
        req.flash('roleEditFailure', validationResult(req).array()[0].msg);
        return res.redirect('back');
    }
    // form takes in permissions as comma separated, potentially with leading or trailing whitespace
    var permissionsWS = req.body.newPermissions.split(',');
    var permissions = [];
    permissionsWS.forEach((element) => {
        permissions.push(element.trim());
    });
    // variable permissions is now an array of permissions with no leading or trailing whitespace
    Role.updateOne({
        _id: req.body.id
    }, {
        permissions
    }).catch(err => {
        req.flash('roleEditFailure', 'Unknown error occurred when updating role.');
    });
    req.flash('roleEditSuccess', 'Role edited successfully!');
    res.redirect('back');
});

/**
 * This promise resolves a boolean based on whether the user 
 * has a given permission
 * @param {object} user - a Mongoose document representing the user to be checked
 * @param {string} permission - the permission to check against
 */
var checkPermission = function (user, permission) {
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
                remaining--;
                if (!remaining) {
                    resolve(false);
                }
            });
        });
    });
};
module.exports = app;
module.exports.checkPermission = checkPermission;