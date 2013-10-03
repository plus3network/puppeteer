var ssh = require('ssh2');
var parse = require('./ssh_options');
var colors = require('colors');
var fs = require('fs');
var ProgressBar = require('progress');

module.exports = function (options, callback) {
  options = parse(options);
  fs.stat(options.src, function (err, stat) {
    if (err) return callback(err); 
    var conn = new ssh();
    conn.on('ready', function () {
      conn.sftp(function (err, sftp) {
        var readStream = fs.createReadStream(options.src);
        var writeStream = sftp.createWriteStream(options.dest);
        var bar = new ProgressBar("Uploading ".cyan+options.src+" ["+":bar".green+"] "+":percent ".cyan, {
          total: stat.size,
          incomplete: ' ',
          width: 40
        });
        writeStream.on('error', function (err) {
          conn.end();
          console.log('');
          callback(err);
        });
        writeStream.on('close', function () {
          conn.end();
          console.log('');
          callback(null, options);
        });
        readStream.on('data', function (buffer) {
          bar.tick(buffer.length);
        });

        // Start the stream
        readStream.pipe(writeStream); 
      });
    });
    conn.connect(options);
  });
};
