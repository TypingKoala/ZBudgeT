/*jshint esversion: 6 */

// Initialize User Schema
const User = require('../../models/user');

// Crypto
const crypto = require('crypto');

// Require Express-csv
const csv = require('express-csv');

// Require Dateformat
var dateFormat = require('dateformat');
var now = new Date();

// Initialize toggles
var toggles = require('../toggles.json');
var featuretoggles = require('feature-toggles');
featuretoggles.load(toggles);
// Set up Google Cloud Storage
const Storage = require('@google-cloud/storage');
const storage = new Storage({
    projectId: 'zbudget-212115',
    keyFilename: './zbudget-ea43880fe032.json'
});
const zbudgetBucket = storage.bucket('zbudget');
var name = crypto.randomBytes(16).toString('hex') + '.pdf'
const file = zbudgetBucket.file(name)
var writeStreamOptions = {
    gzip: true,
    metadata: {
        cacheControl: 'public, max-age=31536000',
        contentType: 'application/pdf',
        name
    },
    public: true
}

// Promise that returns a link to a generated user report
function makepdf(req, res, next) {
    var fonts = {
        Roboto: {
            normal: './controllers/reports/fonts/Roboto-Regular.ttf',
            bold: './controllers/reports/fonts/Roboto-Medium.ttf'
        }
    };
    // Initialize PDFMake
    const pdfmake = require('pdfmake');
    var printer = new pdfmake(fonts);
    var fs = require('fs');

    // When editing, ensure that new users are appended to correct index number at docDefinition.content[4].text
    var docDefinition = {
        content: [{
                text: 'ZBudgeT User Report\n',
                style: 'header'
            },
            {
                text: 'Generated on ' + dateFormat(now, 'longDate') + ' at ' + dateFormat(now, 'longTime') + '\n\n',
                fontSize: 9
            },
            {
                text: 'This report will print out a list of users that are currently registered on the website.\n\n'
            },
            {
                text: 'Users:\n\n',
                style: 'subHeader'
            },
            {
                text: [
                    // The users are appended here on docDefinition.content[3].text
                    // 'Name: John Doe\n',
                    // 'Email: test@example.com\n',
                    // 'Roles: admin, user\n'
                ]
            }
            // ,
            // {
            //     text: [
            //         'It is however possible to provide an array of texts ',
            //         'to the paragraph (instead of a single string) and have ',
            //         {text: 'a better ', fontSize: 15, bold: true},
            //         'control over it. \nEach inline can be ',
            //         {text: 'styled ', fontSize: 20},
            //         {text: 'independently ', italics: true, fontSize: 40},
            //         'then.\n\n'
            //     ]
            // },
            // {
            //     text: 'Mixing named styles and style-overrides',
            //     style: 'header'
            // },
            // {
            //     style: 'bigger',
            //     italics: false,
            //     text: [
            //         'We can also mix named-styles and style-overrides at both paragraph and inline level. ',
            //         'For example, this paragraph uses the "bigger" style, which changes fontSize to 15 and sets italics to true. ',
            //         'Texts are not italics though. It\'s because we\'ve overriden italics back to false at ',
            //         'the paragraph level. \n\n',
            //         'We can also change the style of a single inline. Let\'s use a named style called header: ',
            //         {
            //             text: 'like here.\n',
            //             style: 'header'
            //         },
            //         'It got bigger and bold.\n\n',
            //         'OK, now we\'re going to mix named styles and style-overrides at the inline level. ',
            //         'We\'ll use header style (it makes texts bigger and bold), but we\'ll override ',
            //         'bold back to false: ',
            //         {
            //             text: 'wow! it works!',
            //             style: 'header',
            //             bold: false
            //         },
            //         '\n\nMake sure to take a look into the sources to understand what\'s going on here.'
            //     ]
            // }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true
            },
            subHeader: {
                fontSize: 14,
                bold: true
            }
        }
    };

    // Add users to the report
    User.find({}, (err, allUsers) => {
        if (err) next(err);
        allUsers.forEach((user) => {
            docDefinition.content[3].text.push(
                `Name: ${user.name}\n`,
                `Email: ${user.email}\n`,
                `Roles: ${user.roles.join()}\n`
            )
        });
        // If using GCS, then redirect to publicLink
        if (featuretoggles.isFeatureEnabled('reportsUseGoogleCloudStorage')) {
            var pdfDoc = printer.createPdfKitDocument(docDefinition);
            pdfDoc.pipe(file.createWriteStream(writeStreamOptions)
                .on('finish', () => {
                    var publicLink = 'https://storage.googleapis.com/zbudget/' + name
                    res.redirect(publicLink)
                }))
            pdfDoc.end();
        }
        // If not using GCS, then write directly to response
        if (!featuretoggles.isFeatureEnabled('reportsUseGoogleCloudStorage')) {
            res.writeHead(200, 'OK', {
                'Content-type': 'application/pdf'
            });
            pdfDoc.on('data', (data) => {
                res.write(data);
            });
            pdfDoc.end();
            pdfDoc.on('end', () => res.end());
        }
    });
}

function makecsv(req, res, next) {
    var generatedString = 'Generated on ' + dateFormat(now, 'longDate') + ' at ' + dateFormat(now, 'longTime');
    data = [
        ['Name', 'Email', 'Roles', 'Last Signed In', generatedString]
    ];
    User.find({}, (err, allUsers) => {
        if (err) next(err);
        allUsers.forEach((user) => {
            data.push([user.name, user.email, user.roles, dateFormat(user.lastSignedIn, 'shortDate')]);
        });
        res.csv(data);
    });
}

module.exports.makepdf = makepdf;
module.exports.makecsv = makecsv;