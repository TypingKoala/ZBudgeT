// Require Express
const express = require('express');

// Intitialize App
const app = express.Router();

// Require MD5 (for avatars)
const md5 = require('md5');


module.exports = app