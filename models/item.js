var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    description: {
        type: String
    },
    amount: {
        type: Number
    },
    budget: {
        type: String
    },
    date: {
        type: String
    },
    reimbursementType: {
        type: String
    },
    additionalInfo: {
        type: String
    },
    attachments: {
        type: Array
    },
});

var Item = mongoose.model('Item', ItemSchema);

module.exports = Item;