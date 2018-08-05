var hooks = require('hooks');
const dotenv = require('dotenv');
dotenv.config()

hooks.beforeEach(function (transactions) {
  transactions.request.headers.Authorization = process.env.apiTestHeaders;
});