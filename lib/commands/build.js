var async = require('async');
var exec = require('child_process').exec;
var colors = require('colors');
var sshexec = require('../sshexec');
var scp = require('../scp');

module.exports = function (program, callback) {
  program
    .command('build [type] [host]')
    .description('This will setup a new server using puppet')
    .option('-u, --user <user>', 'The user to login with (Default: root)', 'root')
    .option('-P', 'Prompt for password')
    .option('--ssh-identity <ssh-identity>', 'The identity file to use')
    .option('--passphrase', 'The passphrase  to use with the identity file')
    .action(function (type, host, env) {

      if (!type) {
        console.error('You must supply a the type of server'.red);
        program.help();
        process.exit();
      }

      if (!host) {
        console.error('You must supply a the host'.red);
        program.help();
        process.exit();
      }

      var tasks = [];

      tasks.push(function (cb) {
        if (env.P) {
          program.password('Password for '+env.user+'@'+host+': ', function (pass) {
            env._password = pass;
            cb();
          });
        } else {
          cb();
        }
      });

      // pacakge up the puppet files
      tasks.push(function (cb) {
        console.log('Creating'.cyan+' /tmp/puppet.tgz');
        var cmd = 'cd '+process.cwd()+'/puppet/ && tar -zcvf /tmp/puppet.tgz *';
        exec(cmd, function (err, stdout) {
          if (err) return cb(err);
            cb(null, stdout);
        });
      });

      // copy package to the server
      tasks.push(function (cb) {
        var options = {
          host: host,
          username: env.user,
          password: env._password,
          privateKey: env.sshIdentity,
          passphrase: env.passphrase,
          src: '/tmp/puppet.tgz',
          dest: '/tmp/puppet.tgz'
        };
        scp(options, cb);
      });

      // untar package on server
      tasks.push(function (cb) {
        var options = {
          cmd: 'mkdir -p /tmp/puppet && cd /tmp/puppet && tar -zxvf /tmp/puppet.tgz',
          host: host,
          username: env.user,
          password: env._password,
          passphrase: env.passphrase,
          privateKey: env.sshIdentity
        };
        console.log('Expanding'.cyan+' /tmp/puppet.tgz on '+host);
        sshexec(options, cb);
      });

      // install puppet
      tasks.push(function (cb) {
        var options = {
          cmd: 'apt-get update && apt-get -y install puppet',
          host: host,
          username: env.user,
          password: env._password,
          passphrase: env.passphrase,
          privateKey: env.sshIdentity
        };
        console.log('Installing'.cyan+' puppet on '+host);
        sshexec(options, cb);
      });

      // apply manifest
      tasks.push(function (cb) {
        var options = {
          cmd: 'sudo puppet apply --modulepath "/tmp/puppet/modules" --fileserverconfig=/tmp/puppet/fileserver.conf /tmp/puppet/manifests/'+type+'.pp --detailed-exitcodes --verbose && rm -rf /tmp/puppet*',
          host: host,
          username: env.user,
          privateKey: env.sshIdentity,
          passphrase: env.passphrase,
          password: env._password
        };
        console.log('Running'.cyan+' puppet apply on '+host);
        sshexec(options, cb);
      });

      // run everything
      async.series(tasks, function (err, results) {
        if (err) {
          console.error('Oops!:'.red, err);
          if (err.stack) console.log(err.stack);
        }
      console.log('Setup Complete! Enjoy your new server :)'.green);
      callback();
      });
    });
};
