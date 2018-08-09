/**
 * Middleware that validates user signed-in status 
 * or redirects users to the signin page
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns undefined
 */
function signIn(req, res, next) {
    if (req.user) {
        return next();
    } else {
        return res.redirect('/signin');
    }
}

// Express middleware that writes permissions to req.permissions
var addPermissions = function (req, res, next) {
    if (req.user) {
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
                remaining--;
                if (!remaining) {
                    next();
                }
            });
        });
    } else {
        next();
    }
};
/**
 * Function that returns middleware that checks for
 * given permission, or redirects to sign in page
 * @param {String} permission The permission string to check against in order to access
 * @returns Middleware
 */
function checkAccessMW(permission) {
    return function (req, res, next) {
        if (req.user.permissions[permission]) {
            next();
        } else {
            // If there is no roles permission
            req.flash('error', "You don't have the necessary permissions to access that page.");
            res.redirect('/signin');
        }
    };
}


/**
 * Takes in a permission name, the desired context, and the desired type. Returns
 * the locale if the permission matches the conditions, or it returns false.
 * Example: permissioncheck('house.items.view', 'items', 'view') returns 'house'
 * @param {String} permission
 * @param {String} context
 * @param {String} type
 * @returns permission's locale if it matches conditions or false
 */
function permissionCheck(permission, context, type) {
    var splitPerm = permission.split('.');
    if (splitPerm[1] === context && splitPerm[2] === type) {
        return splitPerm[0];
    } else {
        return false;
    }
}


module.exports.signIn = signIn;
module.exports.addPermissions = addPermissions;
module.exports.permissionCheck = permissionCheck;
module.exports.checkAccessMW = checkAccessMW;