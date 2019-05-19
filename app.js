/*jshint esversion: 6 */
/*jshint node: true */

'use strict';

// Start dotenv
const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
    throw result.error;
}

// Variables
const port = process.env.PORT || 3000;

// Initialize express
const express = require('express');
const app = express();


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