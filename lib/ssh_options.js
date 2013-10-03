var fs = require('fs');
module.exports = function (options) {
  if (options.privateKey) {
    options.privateKey = fs.readFileSync(options.privateKey, 'utf8');
  }
  if (process.env.SSH_AUTH_SOCK) {
    options.agent = process.env.SSH_AUTH_SOCK;
  }
  return options;
}
