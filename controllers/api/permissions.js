/*jshint esversion:6 */
const express = require('express');
const app = express.Router();

// List the type
var permissionContext = [
    'global',
    'house'
];
var permissionSubcontext = [
    'roles',
    'budgets',
    'items', 
    'reports',
    'users'
];
var permissionType = [
    'view',
    'edit'
];

/**
 * Takes in permissions arrays that define permission structure
 * Returns a complete list of all permissions
 * @param {Array} permissionContext
 * @param {Array} permissionSubcontext
 * @param {Array} permissionType
 * @returns
 */
function buildPermissions(permissionContext, permissionSubcontext, permissionType) {
    var permissions = [];
    permissionContext.forEach(pc => {
        permissionSubcontext.forEach(ps => {
            permissionType.forEach(pt => {
                permissions.push({value: `${pc}.${ps}.${pt}`});
            });
        });
    });
    return permissions;
}

app.get('/list', (req, res) => {
    res.json({
        permissions: buildPermissions(permissionContext, permissionSubcontext, permissionType)
    });
});


module.exports = app;