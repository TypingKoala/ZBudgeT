var formidable = require('formidable'),
    http = require('http'),
    util = require('util');
    express = require('express');
    app = express.Router();

app.post('/', (req, res) => {
    res.send('hello')
})

module.exports = app;