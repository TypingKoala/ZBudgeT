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
var addPermissions = function(req, res, next) {
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
                remaining --;
                if (!remaining) {
                    next();
                }
            });
        });
    } else {
        next();
    }   
};


module.exports.signIn = signIn;
module.exports.addPermissions = addPermissions;