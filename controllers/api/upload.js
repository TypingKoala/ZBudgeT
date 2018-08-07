var formidable = require('formidable');
var express = require('express');
var app = express.Router();
var os = require('os');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var mkdirp = require('mkdirp'); // Makes directories recursively
var rimraf = require('rimraf'); // Deletes non-empty directories
var Raven = require('raven'); // Sentry.io Error Handling
Raven.config('https://e92de8eba7ff4a7e84a0d72e8ff61a8d@sentry.io/1256326').install();

app.use(bodyParser.text());

app.post('/upload', (req, res, next) => {
    var form = new formidable.IncomingForm();
    var fileId = crypto.randomBytes(8).toString('hex');
    uploadDir = os.tmpdir() + '/zbudget/' + fileId;
    mkdirp(uploadDir, (err) => {
        if (err) next(err);
        // Preserve file extensions
        form.keepExtensions = true;
        // Set Max File Size to 20 MB
        form.maxFileSize = 20 * 1024 * 1024;
        // Calls the .parse() method on the request
        form.parse(req);
        form.on('fileBegin', (name, file) => {
            file.path = uploadDir + '\\' + file.name;
        });
        form.on('end', () => {
            res.status = 200;
            res.send(fileId.toString());
        })
    });
});

// Implement FilePond Deletes
app.delete('/upload', (req, res) => {
    var fileId = req.body;
    deleteDir = os.tmpdir() + '/zbudget/' + fileId;
    rimraf(deleteDir, (err) => {
        if (err) return Raven.captureException(err);
        console.log(deleteDir + ' deleted successfully.')
    });
});


module.exports = app;