#!/usr/bin/env node
var puppeteer = require('../index.js');
puppeteer(process.argv, function (err) {
  process.exit(err ? 1 : 0);
});
