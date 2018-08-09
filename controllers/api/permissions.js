/*jshint esversion:6 */
const express = require('express');
const app = express.Router();

// List the type
var permissionLocale = [
    'global',
    'house'
];
var permissionContext = [
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
 * @param {Array} permissionLocale
 * @param {Array} permissionContext
 * @param {Array} permissionType
 * @returns
 */
function buildPermissions(permissionLocale, permissionContext, permissionType) {
    var permissions = [];
    permissionLocale.forEach(pc => {
        permissionContext.forEach(ps => {
            permissionType.forEach(pt => {
                permissions.push({value: `${pc}.${ps}.${pt}`});
            });
        });
    });
    return permissions;
}

app.get('/list', (req, res) => {
    res.json({
        permissions: buildPermissions(permissionLocale, permissionContext, permissionType)
    });
});


module.exports = app;