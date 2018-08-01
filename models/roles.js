const mongoose = require('mongoose');

var RoleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        unique: true
    },
    permissions: {
        type: Array
    }
});

var Role = mongoose.model('Role', RoleSchema);
module.exports = Role;