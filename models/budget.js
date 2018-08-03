var mongoose = require('mongoose');

var BudgetSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    semester: {
        type: String
    },
    amount: {
        type: Number
    },
    items: {
        type: Array
    }
});

var Budget = mongoose.model('Budget', BudgetSchema);

module.exports = Budget;