var findit = require('findit');
var path = require('path');
var fs = require('fs');
var colors = require('colors');
module.exports = function (program, callback) {
  program.command('types')
    .description('List the types of manifests')
    .action(function (env) {
    var dir = process.cwd()+'/puppet/manifests';
    fs.stat(dir, function (err, stat) {
      if (err) {
        console.error(('Can\'t find '+dir+' ... Make sure you\'re in the right directory').red);
        return callback(err);
      }

      var types = [];
      var finder = findit.find(dir); 
      finder.on('file', function (file) {
        types.push(path.basename(file, '.pp'));
      });
      finder.on('end', function () {
        if (types.length < 1) {
          console.error('There are not types available'.yellow);
          return console.log(new Error('There are no types available'));
        }

        console.log("Available types:".yellow);
        types.forEach(function (type) {
          console.log("  ", type);
        });
      });
    });
  });
};
