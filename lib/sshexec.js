var ssh = require('ssh2');
var parse = require('./ssh_options');

module.exports = function (options, callback) {
  options = parse(options);
  var conn = new ssh();
  conn.on('error', callback);
  conn.on('ready', function () {
    conn.exec(options.cmd, function (err, stream) {
      stream.on('error', callback);
      stream.on('data', function (data, ext) {
        process.stdout.write(data.toString('utf8'));
      });
      stream.on('exit', function (code, signal) {
        conn.end();
        callback(null, options);
      });
    });
  });
  conn.connect(options);
};
