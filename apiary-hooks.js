var hooks = require('hooks');

hooks.beforeEach(function (transactions) {
  transactions.request.headers.Authorization = "Api-Key 273b6bb7cc4246393825e9db951049fcabcc54f0d83d5c1b1199adca205ff4c4"
});