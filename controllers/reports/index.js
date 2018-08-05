// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

// Initialize toggles
var toggles = require('../toggles.json');
var featuretoggles = require('feature-toggles');
featuretoggles.load(toggles);

var reports = [
    {
        name: 'User Report',
        description: 'Lists all user accounts, user info, and roles.',
        csvUrl: '/reports/userreport.csv',
        pdfUrl: '/reports/userreport.pdf'
    }
]

app.get('/', (req, res) => {
    if (req.user) {
        res.render('reports', {
            title: 'Reports',
            user: req.user,
            reports
        });
    } else {
        res.redirect('/signin')
    }
});

app.get('/userreport.pdf', (req, res, next) => {
    if (req.user) {
        const userreport = require('./userreport')
        userreport.makepdf(req, res, next);
    } else {
        res.redirect('/signin')
    }
});

app.get('/userreport.csv', (req, res, next) => {
    if (req.user) {
        const userreport = require('./userreport')
        userreport.makecsv(req, res, next);
    } else {
        res.redirect('/signin')
    }
})



module.exports = app