/*
  Developer: Marzavec
  Description:
*/

'use strict'

// import initial packages
const Core = require('./include/Core');
const args = require('args');
const chalk = require('chalk');

// display sweet ascii banner, because we need to be edgy, amirite?
console.log('');
console.log(chalk.grey(' ███████') + chalk.magenta('╗') + chalk.grey(' ██') + chalk.magenta('╗') + chalk.grey('   ██') + chalk.magenta('╗') + chalk.grey(' ██████') + chalk.magenta('╗') + chalk.grey('  ███████') + chalk.magenta('╗') + chalk.grey('  ██████') + chalk.magenta('╗') + chalk.grey('  █████') + chalk.magenta('╗') + chalk.grey('  ███') + chalk.magenta('╗') + chalk.grey('   ██') + chalk.magenta('╗'));
console.log(chalk.grey(' ██') + chalk.magenta('╔════╝') + chalk.grey(' ██') + chalk.magenta('║') + chalk.grey('   ██') + chalk.magenta('║') + chalk.grey(' ██') + chalk.magenta('╔══') + chalk.grey('██') + chalk.magenta('╗') + chalk.grey(' ██') + chalk.magenta('╔════╝') + chalk.grey(' ██') + chalk.magenta('╔════╝') + chalk.grey(' ██') + chalk.magenta('╔══') + chalk.grey('██') + chalk.magenta('╗') + chalk.grey(' ████') + chalk.magenta('╗') + chalk.grey('  ██') + chalk.magenta('║'));
console.log(chalk.grey(' ███████') + chalk.magenta('╗') + chalk.grey(' ██') + chalk.magenta('║') + chalk.grey('   ██') + chalk.magenta('║') + chalk.grey(' ██████') + chalk.magenta('╔╝') + chalk.grey(' ███████') + chalk.magenta('╗') + chalk.grey(' ██') + chalk.magenta('║') + chalk.grey('      ███████') + chalk.magenta('║') + chalk.grey(' ██') + chalk.magenta('╔') + chalk.grey('██') + chalk.magenta('╗') + chalk.grey(' ██') + chalk.magenta('║'));
console.log(chalk.grey(' ') + chalk.magenta('╚════') + chalk.grey('██') + chalk.magenta('║') + chalk.grey(' ██') + chalk.magenta('║') + chalk.grey('   ██') + chalk.magenta('║') + chalk.grey(' ██') + chalk.magenta('╔══') + chalk.grey('██') + chalk.magenta('╗ ╚════') + chalk.grey('██') + chalk.magenta('║') + chalk.grey(' ██') + chalk.magenta('║') + chalk.grey('      ██') + chalk.magenta('╔══') + chalk.grey('██') + chalk.magenta('║') + chalk.grey(' ██') + chalk.magenta('║╚') + chalk.grey('██') + chalk.magenta('╗') + chalk.grey('██') + chalk.magenta('║'));
console.log(chalk.grey(' ███████') + chalk.magenta('║ ╚') + chalk.grey('██████') + chalk.magenta('╔╝') + chalk.grey(' ██████') + chalk.magenta('╔╝') + chalk.grey(' ███████') + chalk.magenta('║ ╚') + chalk.grey('██████') + chalk.magenta('╗') + chalk.grey(' ██') + chalk.magenta('║') + chalk.grey('  ██') + chalk.magenta('║') + chalk.grey(' ██') + chalk.magenta('║ ╚') + chalk.grey('████') + chalk.magenta('║'));
console.log(chalk.magenta(' ╚══════╝  ╚═════╝  ╚═════╝  ╚══════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═╝  ╚═══╝'));
console.log(chalk.grey(' Developer: ') + chalk.magenta('Marzavec') + '                                ' + chalk.grey('Version:') + chalk.magenta(' 1.0.0'));
console.log('');

// setup app arguements and help
args
  .option('domain', 'Target top level domain')
  .option('wordlist', 'Target wordlist file', 'wordlists/all.txt')
  .option('limit', 'Limit UDP socket count', 150)
  .option('update', 'Update cached nameserver list file', false)
  .option('verbose', 'Output found subdomains live', true)
  .option('noreport', 'Prevent saving of report', false)
  .option('timeout', 'UDP timeout value (milliseconds)', 10000)
  .option('recordttl', 'Minimum dns record ttl', 60)
  .option('ignore', 'Comma seperated list of known false positives to ignore')
  .option('port', 'Target port to bind the API to', 7575)
  .command('http', 'Start HTTP server for API use', () => { exposeAPI = true; })
  .examples([{
    usage: 'node main.js -d lyka.pro',
    description: 'Starts a scan with default settings'
  },
  {
    usage: 'node main.js -d lyka.pro -w wordlists/top_50.txt -l 20',
    description: 'Starts a scan with max 20 udp sockets using the wordlist file "top_50.txt"'
  },
  {
    usage: 'node main.js http -p 8080',
    description: 'Initializes the http api on port 8080 and waits'
  }]);

let exposeAPI = false;
const flags = args.parse(process.argv, {
  mainColor: ['magenta', 'bold'],
  subColor: ['gray']
})

// start main application
const coreApp = new Core(flags, exposeAPI);
