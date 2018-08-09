/*jshint esversion: 6 */
// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

// Initialize toggles
var toggles = require('../toggles.json');
var featuretoggles = require('feature-toggles');
featuretoggles.load(toggles);

// Require Authorize Middleware
const authorize = require('../../middlewares/authorize');


var reports = [{
    name: 'User Report',
    description: 'Lists all user accounts, user info, and roles.',
    csvUrl: '/reports/userreport.csv',
    pdfUrl: '/reports/userreport.pdf'
}];

app.get('/', authorize.signIn, authorize.checkAccessMW('global.reports.view'), (req, res) => {
    res.render('reports', {
        title: 'Reports',
        user: req.user,
        reports
    });
});

app.get('/userreport.pdf', authorize.signIn, authorize.checkAccessMW('global.reports.view'), (req, res, next) => {
        const userreport = require('./userreport');
        userreport.makepdf(req, res, next);
});

app.get('/userreport.csv', authorize.signIn, authorize.checkAccessMW('global.reports.view'), (req, res, next) => {
        const userreport = require('./userreport');
        userreport.makecsv(req, res, next);
});



module.exports = app;