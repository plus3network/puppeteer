var program = require('commander');
var findit = require('findit');

var puppeteer = module.exports = function (argv, callback) {
  if (typeof(callback) !== 'function') callback = function () { };
  program.version('0.0.1');

  var cmdFinder = findit.find(__dirname+'/lib/commands');

  cmdFinder.on('file', function (file, stat) {
    var cmd = require(file);
    cmd(program, callback);
  });

  cmdFinder.on('end', function () {
    program.parse(argv);
    if (!program.args.length) {
      program.help();
      callback();
    }
  });

};
