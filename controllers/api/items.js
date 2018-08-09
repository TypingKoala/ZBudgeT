const express = require('express');
const app = express.Router();

// Lists all status options
function getStatusOptions() {
    return ['opened', 'issues', 'closed', ''];
}

app.get('/status/all', (req, res) => {
    res.json({
        status: 200,
        statusMessage: 'Success',
        results: getStatusOptions
    });
});


module.exports = app;
module.exports.getStatusOptions = getStatusOptions;

