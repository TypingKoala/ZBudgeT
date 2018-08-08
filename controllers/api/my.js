/*jshint esversion:6*/
const express = require('express');
// Router added at "/api/my"
const app = express.Router();
const passport = require('passport');


app.get('/userinfo', passport.authenticate('headerapikey', {
        session: false,
        failureRedirect: '/api/unauthorized'
    }),
    (req, res) => {
        res.json({
            status: '200',
            statusMessage: 'Success',
            content: {
                name: req.user.name,
                email: req.user.email,
                roles: req.user.roles,
                apiKey: req.user.apiKey
            }
        });
    });


app.get('/roles', passport.authenticate('headerapikey', {
        session: false,
        failureRedirect: '/api/unauthorized'
    }),
    (req, res) => {
        res.json({
            status: '200',
            statusMessage: 'Success',
            content: {
                roles: req.user.roles
            }
        });
    });

app.patch('/roles', passport.authenticate('headerapikey', {
        session: false,
        failureRedirect: '/api/unauthorized'
    }),
    (req, res, next) => {
        if (req.body.newRoles) {
            req.body.newRoles.forEach(element => {
                if (!req.user.roles.includes(element)) {
                    req.user.roles.push(element);
                }
            });
            req.user.save();
            res.json({
                status: '200',
                statusMessage: 'Success',
                content: {
                    roles: req.user.roles
                }
            });
        } else {
            res.json({
                status: '400',
                statusMessage: 'Malformed Request'
            });
        }
    });

module.exports = app;