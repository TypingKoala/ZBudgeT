var mongoose = require('mongoose');

var ResetReqSchema = new mongoose.Schema({
    email: {
        type: String
    },
    reqTime: {
        type: Date,
        default: Date.now
    }
});

var ResetReq = mongoose.model('ResetReq', ResetReqSchema);

module.exports = ResetReq;