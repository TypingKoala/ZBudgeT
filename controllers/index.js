/*jshint esversion: 6 */
// Requires
const express = require('express');
const app = express.Router();
var toggles = require('./toggles.json');
var featuretoggles = require('feature-toggles');
const User = require('../models/user.js');
const mongoose = require('../middlewares/mongoose.js');
var session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');
var addPermissions = require('../middlewares/authorize').addPermissions;
var passport = require('passport');


// Initialize toggles
featuretoggles.load(toggles);

// Initialize Express-Flash
const flash = require('express-flash');
app.use(flash());

// Use Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Require and Initialize Sessions & MongoStore
const MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: process.env.mongoStoreSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: null
    },
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));

// Configure Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Local Login if Feature Enabled
if (featuretoggles.isFeatureEnabled('localLogin')) {
    var LocalStrategy = require('passport-local').Strategy;
    passport.use('local', new LocalStrategy({
            usernameField: 'email',
        },
        function (username, password, done) {
            User.findOne({
                email: username
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Incorrect email.'
                    });
                }
                user.validPassword(password, (err, isMatch) => {
                    if (!isMatch) {
                        return done(null, false, {
                            message: 'Incorrect password.'
                        });
                    } else {
                        return done(null, user);
                    }
                });
            });
        }
    ));
}

// Configure MIT Login if Feature enabled
if (featuretoggles.isFeatureEnabled('mitLogin')) {
    const {
        Issuer
    } = require('openid-client');
    const mitIssuer = new Issuer({
        issuer: 'https://oidc.mit.edu/',
        authorization_endpoint: 'https://oidc.mit.edu/authorize',
        token_endpoint: 'https://oidc.mit.edu/token',
        userinfo_endpoint: 'https://oidc.mit.edu/userinfo',
        jwks_uri: 'https://oidc.mit.edu/jwk',
    }); // => Issuer
    console.log('Set up issuer MIT');
    const client = new mitIssuer.Client({
        client_id: process.env.oidc_client_id,
        client_secret: process.env.oidc_client_secret
    });
    client.CLOCK_TOLERANCE = 5; // to allow a 5 second skew
    console.log('Set up client MIT');
    const {
        Strategy
    } = require('openid-client');
    // Set up redirect_uri based on Node Environment
    if (process.env.NODE_ENV === 'production') {
        var redirect_uri = 'http://dev.johnnybui.com:3000/oidc';
    } else {
        var redirect_uri = 'http://localhost:3000/oidc';
    }
    // Parameters for OIDC
    const params = {
        scope: "email,profile,openid",
        redirect_uri
    };
    passport.use('oidc', new Strategy({
        client,
        params
    }, (tokenset, userinfo, done) => {
        // Checks if userinfo.email is defined
        if (userinfo.email) {
            User.findOne({
                email: userinfo.email
            }, function (err, user) {
                if (err) return done(err);
                // If no user, create user and return
                if (!user) {
                    // Generate random password
                    const passwordBuf = crypto.randomBytes(16);
                    const password = passwordBuf.toString('base64');
                    // Generate API Key
                    const apiBuf = crypto.randomBytes(32);
                    const apiKey = apiBuf.toString('hex');
                    var newUserData = {
                        name: userinfo.name,
                        email: userinfo.email,
                        password,
                        apiKey
                    };
                    User.create(newUserData, (err, user) => {
                        if (err) {
                            done(err);
                        } else {
                            return done(null, user);
                        }
                    });
                } else {
                    return done(null, user);
                }
            });
        } else {
            // If userinfo.email is not defined, then user has not given appropriate permissions
            console.log('Appropriate permissions not given.');
            return done('Appropriate permissions not given.');
        }
    }));
}

// Configure API Login if feature toggle enabled
if (featuretoggles.isFeatureEnabled('apiLogin')) {
    var HeaderAPIKeyStrategy = require('passport-headerapikey').HeaderAPIKeyStrategy;
    passport.use(new HeaderAPIKeyStrategy({
            header: 'Authorization',
            prefix: 'Api-Key '
        },
        false,
        function (apikey, done) {
            User.findOne({
                apiKey: apikey
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                return done(null, user);
            });
        }
    ));
}

// Serialize and Deserialize Passport Sessions
passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        user.lastSignedIn = Date.now();
        user.save();
        done(err, user);
    });
});


// Static Server
app.use(express.static('public'));

// Check Permissions Middleware
app.use(addPermissions);

// Routes
app.use(require('./home'));
app.use(require('./signup'));
app.use(require('./signin'));
app.use(require('./settings'));
app.use('/api', require('./api'));
app.use(require('./budgets'));
app.use(require('./spending'));
app.use('/reports', require('./reports'));
app.use(require('./roles'));
app.use(require('./users'));

// Routes only for localLogin
if (featuretoggles.isFeatureEnabled('localLogin')) {
    app.use(require('./passwordreset'));
}

// GET /signout
app.get('/signout', (req, res) => {
    req.logout();
    res.redirect('/signin');
});

// 404
app.use((req, res, next) => {
    res.status = 404;
    res.redirect('/404.html');
});


// 500
app.use((err, req, res, next) => {
    res.status = err.status || 500;
    console.log(err.message);
    let sentry_event_id = res.sentry;
    console.log('Sentry Event ID: ' + sentry_event_id);
    res.render('error', {
        message: "Uh oh! That wasn't supposed to happen. Don't worry, we've been notified.",
        sentry_event_id
    });
});

module.exports = app;