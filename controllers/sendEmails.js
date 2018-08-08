const express = require('express');
const app = express.Router();
const User = require('../models/user');
const ResetReq = require('../models/resetreqs');
const fs = require('fs');
const path = require('path');

// Require Mailgun
var mailgun = require('mailgun-js')({
    apiKey: process.env.mailgunKey,
    domain: process.env.mailgunDomain
});

/**
 * Function to send an email to a receipient with an optional button.
 * Returns undefined
 * @param {String} emailAddress of email recpient
 * @param {Object} body object with parameters subject, title, preheader, superheader, header, paragraph, buttonText, buttonLink
 */
function sendEmail(emailAddress, body) {
    const pug = require('pug');

    var emailbody = pug.renderFile('./views/emailtemplate.pug', {
        title: body.title,
        preheader: body.preheader,
        superheader: body.superheader,
        header: body.header,
        paragraph: body.paragraph,
        buttonText: body.buttonText,
        buttonLink: body.buttonLink
    });
    var data = {
        from: 'ZBudgeT <support@johnnybui.com>',
        to: emailAddress,
        subject: body.subject,
        html: emailbody
    };
    mailgun.messages().send(data, function (error, body) {
        if (error) console.log(error);
        console.log(body);
    });
}

module.exports = sendEmail