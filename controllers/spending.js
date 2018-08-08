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

const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

app.get('/spending', (req, res) => {
    res.render('spending', {
        title: 'Spending',
        user: req.user,
        successMessage: req.flash('success')[0],
        failureMessage: req.flash('failed')[0]
    });
});

function validateRequiredFields(req, res, next) {
    if (req.body.name && req.body.email && req.body.description && req.body.amount
        && req.body.budget && req.body.date && req.body.reimbursementType && req.body.attachments.length > 0) {
            body('email').isEmail().normalizeEmail();
        } else {
            req.flash('failure', 'Not all form fields were filled out, or upload did not complete');
            req.redirect('back');
        }
}

app.post('/spending/create', validateRequiredFields, (req, res) => {
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
        subject: 'Your Reimbursement Request',
        title: 'Reimbursement Request',
        preheader: 'Here is a copy of your reimbursement request for your records.',
        superheader: 'HI',
        header: 'We successfully received your reimbursement request!',
        paragraph: `Here is a copy for your own records. <br />
                name: ${req.body.name} <br />
                email: ${req.body.email} <br />
                description: ${req.body.description} <br />
                amount: ${req.body.amount} <br />
                budget: ${req.body.budget} <br />
                date: ${req.body.date} <br />
                reimbursementType: ${req.body.reimbursementType} <br />
                additionalInfo: ${req.body.additionalInfo} <br /><br />
                Best,<br />
                ZBudget Support`
    });
    res.redirect('back');
});

module.exports = app;