/*
  Developer: Marzavec
  Description:
*/

'use strict'

const chalk = require('chalk');
const csv = require('ya-csv');
const fs = require('fs');

const OpenDns = require('./OpenDns');
const WordlistEngine = require('./WordlistEngine');
const DnsHandler = require('./DnsHandler');

class Core {
  constructor (args, exposeAPI) {
    this.args = args;
    this.isApi = exposeAPI;
    this.dnsHandlers = [];
    this.results = [];
    this.announceInterval = null;
    this.recordsChecked = 0;
    this.handlersDone = 0;

    this.args.ignore = (typeof this.args.ignore === 'string') ? this.args.ignore.split(',') : false;

    this.nameServers = new OpenDns(this.args.update, this.args.timeout, function () { this.onNsReady(); }.bind(this));
  }

  onNsReady () {
    console.log(chalk.magenta(' Loading') + chalk.grey(' wordlist file. . .'));
    this.wlEngine = new WordlistEngine(this.args.wordlist, function () { this.onWlReady(); }.bind(this));
  }

  onWlReady () {
    if (this.isApi) {
      this.startHttp();
      return;
    }

    console.log(chalk.magenta(' Building ') + chalk.grey(this.args.limit + ' udp sockets. . .'));
    this.buildDnsHandlers();
  }

  buildDnsHandlers () {
    for (let i = 0; i < this.args.limit; i++) {
      this.dnsHandlers.push(new DnsHandler(this.args.domain, this.nameServers.getDnsIp(), this.args.timeout, function (n,d) { this.lookupFinished(n,d); }.bind(this)));
    }

    this.startScan();
  }

  startScan () {
    console.log(chalk.magenta(' Scan') + chalk.grey(' started:'));
    console.log('');

    this.announceInterval = setInterval(function () {
      console.log(chalk.grey('    * Checked ') + chalk.magenta(this.recordsChecked) + chalk.grey(' subdomains out of ') + chalk.magenta(this.wlEngine.origLength));
    }.bind(this), 15000);

    for (let i = 0; i < this.args.limit; i++) {
      this.dnsHandlers[i].test(this.wlEngine.getNext());
    }
  }

  lookupFinished (dns, data) {
    if (data.err !== 'Timed out') this.recordsChecked++;

    if (data.err && data.err !== 'No answer') {
      if (data.err === 'Wordlist empty') {
        this.handlersDone++;
        if (this.handlersDone == this.args.limit) this.scanFinished();
        return;
      } else if (data.err === 'Timed out') { // bad nameserver?
        dns.updateNameserver(this.nameServers.getDnsIp());
        dns.retest();
        return;
      } else {
        console.log(chalk.red(' * Unknown UDP error: ') + chalk.grey(data.err));
      }
    }

    if (data.err === false) {
      data.result.forEach((info) => {

        if (info.ttl > this.args.recordttl) {
          let ignore = this.args.ignore;
          if (this.args.ignore !== false && (this.args.ignore.indexOf(info.name) !== -1 || this.args.ignore.indexOf(info.address || info.data) !== -1)){
            ignore = true;
          }

          if (ignore !== true){
            this.results.push([
              info.name,
              info.address || info.data
            ]);

            if (this.args.verbose) console.log(chalk.grey('    Found ') + chalk.magenta(info.name) + chalk.grey(' with address: ') + chalk.magenta(info.address || info.data));
          }
        }
      });
    }

    dns.updateNameserver(this.nameServers.getDnsIp());
    dns.test(this.wlEngine.getNext());
  }

  scanFinished () {
    clearInterval(this.announceInterval);

    console.log('');
    console.log(chalk.green(' Finished!'));
    console.log(chalk.grey(' Checked ') + chalk.magenta(this.recordsChecked) + chalk.grey(' possible subdomains, found ') + chalk.magenta(this.results.length) + chalk.grey(' results.'));

    if (this.args.noreport === false) {
      let reportName = this.saveReport();
      console.log(chalk.grey(' Report saved as: ') + chalk.magenta(reportName) + chalk.grey('!'));
    }
  }

  saveReport () {
    const reportPath = this.genReportPath();
    const file = fs.createWriteStream(reportPath);
    const writer = new csv.CsvWriter(file);

    writer.writeRecord(['Subdomain', 'Address']);

    for (let i = 0; i < this.results.length; i++) {
      writer.writeRecord(this.results[i]);
    }

    return reportPath;
  }

  genReportPath () {
    let today = new Date();

		let year = today.getFullYear();

		let month = today.getMonth() + 1;
		month = (month < 10 ? '0' : '') + month;

		let day  = today.getDate();
		day = (day < 10 ? '0' : '') + day;

    let reportPath = `reports/${this.args.domain}_${year}_${month}_${day}.csv`;

    let i = 1;
    while (fs.existsSync(reportPath)) {
      reportPath = `reports/${this.args.domain}_${year}_${month}_${day}_${i}.csv`;
      i++;
    }

		return reportPath;
	}

  startHttp () {
    console.log(' Starting HTTP server. . .');
    console.log(' API functions removed in this release due to bugs');
    console.log(' Look for future releases where this will be added');
  }
}

module.exports = Core;
