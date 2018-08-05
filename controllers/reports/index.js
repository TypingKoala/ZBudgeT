// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

// Initialize toggles
var toggles = require('../toggles.json');
var featuretoggles = require('feature-toggles');
featuretoggles.load(toggles);

app.get('/reports', (req, res) => {
    if (req.user) {
        res.render('reports', {
            title: 'Reports',
            user: req.user
        })
    } else {
        res.redirect('/signin')
    }
});

app.get('/userreport', (req, res) => {
    if (req.user) {
        const userreport = require('./userreport')
        userreport(req, res);
    } else {
        res.redirect('/signin')
    }
})




module.exports = app