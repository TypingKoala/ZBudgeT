var hooks = require('hooks');

hooks.beforeEach(function (transactions) {
  transactions.request.headers.Authorization = process.env.apiTestHeaders;
});