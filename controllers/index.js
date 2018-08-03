// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

// Import User Schema
const User = require('../models/user.js');

// Initialize toggles
var toggles = require('./toggles.json');
var featuretoggles = require('feature-toggles');
featuretoggles.load(toggles);

// Initialize Mongoose
const mongoose = require('../middlewares/mongoose.js')

// Initialize Express-Flash
const flash = require('express-flash');
app.use(flash());

// Require and Initialize Sessions & MongoStore
var session = require('express-session');
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

// Initialize Passport.js
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
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
console.log('Set up client MIT')


// Configure Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Local Login if Feature Enabled
if (featuretoggles.isFeatureEnabled('localLogin')) {
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
                    console.log('no user')
                    return done(null, false, {
                        message: 'Incorrect email.'
                    });
                }
                user.validPassword(password, (err, isMatch) => {
                    if (!isMatch) {
                        console.log('invalid password')
                        return done(null, false, {
                            message: 'Incorrect password.'
                        });
                    } else {
                        console.log('valid login for ' + user.email);
                        return done(null, user)
                    }
                });
            });
        }
    ));
}

// Configure MIT Login if Feature enabled
if (featuretoggles.isFeatureEnabled('mitLogin')) {
    const {
        Strategy
    } = require('openid-client');
    // Set up redirect_uri based on Node Environment
    if (process.env.NODE_ENV === 'production') {
        var redirect_uri = 'https://zbudget.johnnybui.com/oidc'
    } else {
        var redirect_uri = 'http://localhost:3000/oidc'
    }
    const params = {
        scope: "email,profile,openid",
        redirect_uri
    }
    passport.use('oidc', new Strategy({
        client,
        params
    }, (tokenset, userinfo, done) => {
        if (userinfo.email) {
            User.findOne({
                email: userinfo.email
            }, function (err, user) {
                if (err) return done(err);
                return done(null, user);
            });
        } else {
            console.log('Appropriate permissions not given.')
            return done('Appropriate permissions not given.')
        }
    }));
}

// Serialize and Deserialize Passport Sessions
passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// Static Server
app.use(express.static('public'));

// Routes
app.use(require('./home'))
app.use(require('./signup'));
app.use(require('./signin'));
app.use(require('./settings'));
app.use(require('./api'));
app.use(require('./budgets'));
app.use(require('./reimbursements'));
app.use(require('./reports'));
app.use(require('./roles'));

// Routes only for localLogin
if (featuretoggles.isFeatureEnabled('localLogin')) {
    app.use(require('./passwordreset'));
}

// GET /signout
app.get('/signout', (req, res) => {
    req.logout();
    res.redirect('/signin');
})

// 404
app.use((req, res, next) => {
    res.status = 404;
    res.redirect('/404.html');
});

// 500
app.use((err, req, res, next) => {
    res.status = err.status || 500;
    console.log(err.message);
    res.render('error', {
        message: 'Uh oh! Something went wrong!',
        error: {}
    });
})

module.exports = app;