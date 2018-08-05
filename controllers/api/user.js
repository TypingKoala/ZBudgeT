const express = require('express');
// Router added at "/api"
const app = express.Router();
const passport = require('passport')

const User = require('../../models/user')
const {
    checkPermission
} = require('../roles');


app.get('/checkPermission', passport.authenticate('headerapikey', {
        session: false,
        failureRedirect: '/api/unauthorized'
    }),
    (req, res, next) => {
        if (req.query.email && req.query.permission) {
            User.findOne({
                email: req.query.email
            }, (err, user) => {
                if (err) next(err);
                checkPermission(user, req.query.permission).then((result) => {
                    res.json({
                        status: '200',
                        statusMessage: 'Success',
                        content: {
                            result
                        }
                    })
                })
            })
        } else {
            res.status = 400;
            res.json({
                status: '400',
                statusMessage: 'Incomplete request'
            })
        }
    });


module.exports = app