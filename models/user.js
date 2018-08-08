const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const md5 = require('md5');

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'name is required'
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: 'email is required'
    },
    emailMD5: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: 'password is required'
    },
    roles: {
        type: Array
    },
    apiKey: {
        type: String,
        unique: true,
        required: 'apiKey is required'
    },
    resetToken: {
        type: String
    },
    lastSignedIn: {
        type: Date
    }
});

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password')) {
        // hash password with salt
        bcrypt.hash(user.password, 10, function (err, hash) {
            if (err) return next(err);
            // rewrite password as hashed password
            user.password = hash;
            // Set emailMD5 using user.email and md5 function
            user.emailMD5 = md5(user.email);
            next();
        })
    } else {
        next();
    }

});

UserSchema.methods.validPassword = function (password, cb) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}

UserSchema.statics.authenticate = (email, password, cb) => {
    User.findOne({
        email: email
    }, (err, user) => {
        if (err) {
            console.log(err.message);
            err = new Error('An unknown error has occured.')
            return cb(err);
        }
        if (!user) {
            var err = new Error('There is no account with that email address.');
            err.status = 401;
            return cb(err);
        }
        bcrypt.compare(password, user.password, function (err, result) {
            if (result === true) {
                return cb(null, user);
            } else {
                var err = new Error('Incorrect password.')
                err.status = 401;
                return cb(err);

            }
        })
    })
}

UserSchema.statics.validPassword = (user, password, cb) => {
    bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
            return cb(null, user);
        } else {
            var err = new Error('Incorrect password.')
            err.status = 401;
            return cb(err);

        }
    })
};

var User = mongoose.model('User', UserSchema)
module.exports = User;