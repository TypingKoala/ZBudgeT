/*jshint esversion: 6 */
/*jshint node: true */

'use strict';

// Start dotenv
const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
    throw result.error;
}

// Require Raven
const Raven = require('Raven');
Raven.config('https://e92de8eba7ff4a7e84a0d72e8ff61a8d@sentry.io/1256326', {
    autoBreadcrumbs: true
}).install();
Raven.context(function () {

    // Variables
    const port = process.env.PORT || 3000;

    // Initialize express
    const express = require('express');
    const app = express();

    // Use Raven
    app.use(Raven.requestHandler());

    // Set render engine
    const pug = require('pug');
    app.set('view engine', 'pug');

    // Initialize routes
    const routes = require('./controllers');
    app.use(routes);

    // Start Server
    app.listen(port, () => {
        console.log('The magic happens on port ' + port + '.');
    });
});