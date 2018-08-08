/*jshint esversion:6*/
// Requires
const express = require('express');
const app = express.Router();
const Item = require('../models/item');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const rimraf = require('rimraf'); // Deletes non-empty directories
const Raven = require('raven');
const sendEmail = require('./sendEmails');
const authorize = require('../middlewares/authorize');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

app.get('/spending', authorize.signIn, (req, res) => {
    var failed = req.flash('failedvalidation');
    console.log(failed)
    res.render('spending', {
        title: 'Spending',
        user: req.user,
        successMessage: req.flash('success')[0],
        failureMessage: req.flash('failure')[0],
        failedValidation: failed
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
    sanitizeBody('additionalInfo')
], (req, res) => {
    if (!validationResult(req).isEmpty()) {
        req.flash('failedvalidation', validationResult(req).array());
        return res.redirect('back');
    };
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
    function GCSupload(folderId, cb) {
        var filename = fs.readdirSync(os.tmpdir() + '/zbudget/' + folderId)[0]
        var path = os.tmpdir() + '/zbudget/' + folderId + '/' + filename;
        var extension = filename.split('.').pop()
        var newfilename = crypto.randomBytes(8).toString('hex') + "." + extension
        options = {
            destination: `userUploads/${newfilename}`,
            public: true
        }
        zbudgetBucket.upload(path, options, (err, metadata, apiRes) => {
            if (err) throw(err);
            console.log('https://storage.googleapis.com/zbudget/' + metadata.name)
            cb('https://storage.googleapis.com/zbudget/' + metadata.name)
        })
    }

    // Upload attachments to Google Cloud Storage
    var getAttachments = new Promise((resolve, reject) => {
        if (Array.isArray(req.body.attachments)) {
            attachments = []
            req.body.attachments.forEach((folderId) => {
                GCSupload(folderId, (url) => {
                    attachments.push(url);
                    if (attachments.length === req.body.attachments) {
                        resolve(attachments);
                    }
                });
            });
        } else {
            GCSupload(req.body.attachments, (url) => {
                resolve([url]); 
            });
            
        }
    });
    getAttachments.then((attachments) => {
        Item.create({
            name: req.body.name,
            email: req.body.email,
            description: req.body.description,
            amount: req.body.amount,
            budget: req.body.budget,
            date: req.body.date,
            reimbursementType: req.body.reimbursementType,
            additionalInfo: req.body.additionalInfo,
            attachments
        });
        
        if (typeof req.body.attachments === 'string') {
            req.body.attachments = [req.body.attachments]
        }
        req.body.attachments.forEach((fileId) => {
            deleteDir = os.tmpdir() + '/zbudget/' + fileId;
            rimraf(deleteDir, (err) => {
                if (err) return Raven.captureException(err);
            });
        });
    });
    req.flash('success', 'Thanks! Your expense was successfully recorded.');
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
                Date: ${req.body.date} <br />
                Reimbursement Type: ${req.body.reimbursementType} <br />
                Additional Info: ${req.body.additionalInfo} <br /><br />
                Best,<br />
                ZBudget Support`
    });
    res.redirect('back');
});

module.exports = app;