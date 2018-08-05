require('dotenv').config()

// Requires
var User = require('../models/user');
var Roles = require('../models/roles');

var assert = require('assert');

// Hooks
beforeEach(function() {

})

after(function() {

})


// Tests
describe('User', function() {
    describe('User Schema', function() {

        testFields = ['email', 'name', 'password', 'apiKey'];
        
        testFields.forEach(function(field) {
            it(`should be invalid if ${field} is empty`, function() {
                var user = new User({});
                var err = user.validateSync();
                assert.equal(err.errors[field].message, `${field} is required`)

                user[field] = 'string'
                err = user.validateSync();
                assert.ok(!err.errors[field])
            });
        });
    });
});