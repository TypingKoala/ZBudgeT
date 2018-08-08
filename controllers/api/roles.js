/*jshint esversion:6 */
const express = require('express');
const app = express.Router();
const Role = require('../../models/roles');



app.get('/list', (req, res) => {
    var roleList = []
    Role.find({}).then(roles => {
        roles.forEach(role => {
            roleList.push({value: role.roleName});
        });
        res.json({roles: roleList});
    });
});

module.exports = app