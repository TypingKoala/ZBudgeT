/*jshint esversion:6*/
// Requires
const express = require('express');
const app = express.Router();
const Item = require('../models/item');
const Budget = require('../models/budget');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const rimraf = require('rimraf'); // Deletes non-empty directories
const sendEmail = require('./sendEmails');
const authorize = require('../middlewares/authorize');
const dateFormat = require('dateformat');
const permissionCheck = require('../middlewares/authorize').permissionCheck;
const rename = require('rename');
const getStatusOptions = require('./api/items').getStatusOptions;
const {
    body,
    validationResult,
    query
} = require('express-validator/check');
const {
    sanitizeBody
} = require('express-validator/filter');



app.get('/spending', authorize.signIn, [
    query('filter')
    // check if filter is in this array
    .isIn(getStatusOptions()).withMessage('Filter mode invalid.')
], (req, res) => {
    // Check validator
    if (!validationResult(req).isEmpty()) {
        req.flash('itemsListFailure', validationResult(req).array()[0].msg);
        return res.redirect('/spending');
    }
    // Initialize 'or' conditions based on permissions
    var conditions = [];
    // If global permissions, show all items
    if (req.user.permissions['global.items.view']) {
        conditions = [{}];
        // Otherwise, restrict viewing of items
    } else {
        // Allow viewing of your own items
        conditions.push({
            email: req.user.email
        });
        // For every permission,
        for (var element in req.user.permissions) {
            // Check if it is an items.view permission
            var result = permissionCheck(element, 'items', 'view');
            if (result) {
                // if a 'budget'.items.view permission exists, add 'budget' to conditions
                conditions.push({
                    budget: result
                });
            }
        }
    }

    // Load all budgets
    Budget.find({}).sort({
        name: 'asc'
    }).then(budgets => {
        // If there is no filter param, show all items allowed
        if (!req.query.filter) {
            Item.find().or(conditions).sort({
                dateAdded: 'asc'
            }).then(items => {
                res.render('spending', {
                    title: 'Spending',
                    user: req.user,
                    items,
                    budgets,
                    successMessage: req.flash('success')[0],
                    failureMessage: req.flash('failure')[0],
                    failedValidation: req.flash('failedvalidation'),
                    itemsListFailure: req.flash('itemsListFailure')[0],
                    itemsListSuccess: req.flash('itemsListSuccess')[0]
                });
            });
            // if there is a filter param, use it
        } else {
            Item.find()
                .where('status').equals(req.query.filter)
                .or(conditions)
                .sort({
                    dateAdded: 'asc'
                })
                .then(items => {
                    res.render('spending', {
                        title: 'Spending',
                        user: req.user,
                        items,
                        budgets,
                        filter: req.query.filter,
                        filters: getStatusOptions(),
                        successMessage: req.flash('success')[0],
                        failureMessage: req.flash('failure')[0],
                        failedValidation: req.flash('failedvalidation'),
                        itemsListFailure: req.flash('itemsListFailure')[0],
                        itemsListSuccess: req.flash('itemsListSuccess')[0]
                    });
                });
        }
    });
});

app.post('/spending/create', authorize.signIn, [
    body('email')
    .isEmail().withMessage('Invaid Email Address')
    .normalizeEmail(),
    body('name')
    .not().isEmpty().withMessage('Your name is required')
    .trim()
    .escape(),
    body('description')
    .not().isEmpty().withMessage('Description is required')
    .escape(),
    body('amount')
    .not().isEmpty().withMessage('Amount is required')
    .isCurrency().withMessage('You entered an invalid amount')
    .toFloat().withMessage('You entered an invalid amount'),
    body('budget')
    .not().isEmpty()
    .escape(),
    body('date')
    .not().isEmpty().withMessage('Date is required')
    .toDate().withMessage('You entered an invalid date'),
    body('reimbursementType')
    .not().isEmpty().withMessage('Reimbursement Type is required')
    .escape(),
    body('attachments')
    .not().isEmpty().withMessage('Attachments are required. Make sure to wait for the attachments to upload before submitting.')
    .escape(),
    sanitizeBody('additionalInfo').escape()
], (req, res) => {
    // If validation status failed, flash error message and redirect back
    if (!validationResult(req).isEmpty()) {
        req.flash('failedvalidation', validationResult(req).array());
        return res.redirect('back');
    }

    // If only one folderID, put it into an array
    if (typeof req.body.attachments === 'string') {
        req.body.attachments = [req.body.attachments];
    }

    // Set up Google Cloud Storage
    const Storage = require('@google-cloud/storage');
    const storage = new Storage({
        projectId: 'zbudget-212115',
        keyFilename: './zbudget-ea43880fe032.json'
    });
    const zbudgetBucket = storage.bucket('zbudget');


    /**
     * Function to upload files to GCS based on folderId
     * Returns a string with the public link to the file
     * @param {String} folderId
     */

    // Upload attachments to Google Cloud Storage
    var getAttachmentsUrl = new Promise((resolve, reject) => {
        attachments = [];
        var attachmentLen = req.body.attachments.length;
        req.body.attachments.forEach((folderId) => {
            var filename = fs.readdirSync(os.tmpdir() + '/zbudget/' + folderId)[0];
            var path = os.tmpdir() + '/zbudget/' + folderId + '/' + filename;
            var newfilename = rename(filename, {
                basename: crypto.randomBytes(8).toString('hex')
            });
            options = {
                destination: `userUploads/${newfilename}`,
                public: true
            };
            zbudgetBucket.upload(path, options, (err, metadata, apiRes) => {
                if (err) reject(err);
                console.log('https://storage.googleapis.com/zbudget/' + metadata.name);
                attachments.push('https://storage.googleapis.com/zbudget/' + metadata.name);
                attachmentLen--;
                if (attachmentLen === 0) {
                    resolve(attachments);
                }
            });
        });
    });

    getAttachmentsUrl.then((attachments) => {
        console.log(attachments);
        // Save to items
        Item.create({
            name: req.body.name,
            email: req.body.email,
            description: req.body.description,
            amount: req.body.amount,
            budget: req.body.budget,
            date: dateFormat(req.body.date, 'fullDate'),
            reimbursementType: req.body.reimbursementType,
            additionalInfo: req.body.additionalInfo,
            status: 'opened',
            attachments
        }).then(item => {
            if (!item) {
                // If error, capture, flash, and return a redirect
                req.flash('failure', 'An unknown error occurred saving your request');
                return res.redirect('back');
            } else {
                // Successful: add item to corresponding budget
                var budgetName = req.body.budget.split('.')[0];
                var budgetSemester = req.body.budget.split('.')[1];
                Budget.findOne({
                    name: budgetName,
                    semester: budgetSemester
                }).then(async budget => {
                    await budget.items.push(item._id);
                    budget.save();
                }).catch(err => {
                    req.flash('failure', 'An unknown error occurred saving your request');
                    return res.redirect('back');
                })
                // Flash success message
                req.flash('success', 'Thanks! Your expense was successfully recorded.');
                // Send confirmation email
                sendEmail(req.body.email, {
                    subject: 'Fingers Crossed! Your Reimbursement Request Was Submitted',
                    title: 'Reimbursement Request',
                    preheader: 'Your reimbursement was just submitted for review. Your copy of the request is included in this email!',
                    superheader: 'HI THERE',
                    header: 'Reimbursement Request Submitted',
                    paragraph: `Your reimbursement was just submitted for review. Here is a copy for your records. <br />
                Description: ${req.body.description} <br />
                Amount: $${req.body.amount.toFixed(2)} <br />
                Budget: ${req.body.budget} <br />
                Date: ${dateFormat(req.body.date, 'fullDate')} <br />
                Reimbursement Type: ${req.body.reimbursementType} <br />
                Additional Info: ${req.body.additionalInfo} <br /><br />
                Best,<br />
                ZBudget Support`
                });
                // Redirect back to page
                res.redirect('back');
            }
        }).catch(err => {
            // If error, capture, flash, and return a redirect
            req.flash('failure', 'An unknown error occurred saving your request');
            return res.redirect('back');
        });

        // Delete folders using rimraf
        req.body.attachments.forEach((fileId) => {
            deleteDir = os.tmpdir() + '/zbudget/' + fileId;
            rimraf(deleteDir, (err) => {
                if (err) return console.log(err);
            });
        });
    });
});

app.post('/spending/edit',
    authorize.signIn,
    authorize.checkAccessMW('global.items.edit'), [
        body('status')
        .isIn(getStatusOptions()).withMessage('Status invalid'),
        body('comments')
        .escape(),
        body('id')
        .isMongoId().withMessage('Invalid ID provided.')
    ],
    (req, res) => {
        if (!validationResult(req).isEmpty()) {
            req.flash('failedvalidation', validationResult(req).array());
            return res.redirect('back');
        }
        var update = {};
        if (!req.body.status) {
            update = {
                comments: req.body.comments
            }
        } else {
            update = {
                comments: req.body.comments,
                status: req.body.status
            };
        }
        Item.updateOne({
            _id: req.body.id
        }, update, (err, updated) => {
            req.flash('itemsListSuccess', 'Item edited successfully!');
            res.redirect('back');
        });
    });

module.exports = app;