/* jshint esversion:6 */
// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();
const Budget = require('../models/budget');
const Item = require('../models/item');

const authorize = require('../middlewares/authorize'); // Require Authorize Middleware

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
}

app.get('/budgets', authorize.signIn, authorize.checkAccessMW('global.budgets.view'), (req, res) => {
    Budget.find({}).sort({name: 'asc'}).then(async budgets => {
        await asyncForEach(budgets, async budget => {
            used = 0;
            await asyncForEach(budget.items, async itemid => {
                Item.findById(itemid).then(async (item) => {
                    used += item.amount;
                })
            });
            budget['used'] = used;
        });
        console.log(budgets)
        res.render('budgets', {
            title: 'Budgets',
            user: req.user,
            budgets
        });
    });
});

module.exports = app;