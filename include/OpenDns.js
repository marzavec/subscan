/*
  Developer: Marzavec
  Description:
*/

'use strict'

const chalk = require('chalk');
const https = require('https');
const fs = require('fs');
const updateUrl = 'https://public-dns.info/nameserver/us.txt';
const DnsHandler = require('./DnsHandler');

class OpenDns {
  constructor (forceUpdate, udpTimeout, readyCallback) {
    this.forceUpdate = forceUpdate;
    this.udpTimeout = udpTimeout;
    this.readyCallback = readyCallback;
    this.nsList = [];

    this.needsVerify = false;
    this.verifyTld = ['google.com', 'ebay.com', 'paypal.com'];
    this.verifyDns = '8.8.8.8';
    this.verifySub = '';
    this.verifiers = [];
    this.verifiedList = [];
    this.verifiedCount = 0;
    this.verifiedInterval = null;
    this.verifMaxPasses = 3;
    this.verifPasses = 0;

    this.load();
  }

  load () {
    console.log(chalk.magenta(' Loading') + chalk.grey(' nameservers from cache. . .'));
    if (this.forceUpdate) {
      console.log(chalk.red(' Update forced') + chalk.grey(', starting download. . .'));
      this.update();
      return;
    }

    fs.open('nameservers.txt', 'r', (err, fd) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log(chalk.red(' Missing cached nameserver list') + chalk.grey(', starting download. . .'));
          this.update();
          return;
        }

        throw err;
      }

      this.nsList = fs.readFileSync('nameservers.txt', 'utf8').split("\n");
      console.log(chalk.grey(' Loaded ') + chalk.magenta(this.nsList.length) + chalk.grey(' nameservers.'));

      if (this.needsVerify) {
        this.needsVerify = false;
        this.verifyAll();
        return;
      }

      this.readyCallback();
    });
  }

  update () {
    this.forceUpdate = false;
    let file = fs.createWriteStream('nameservers.txt');

    https.get(updateUrl, (res) => {
      const { statusCode } = res;

      let error;

      if (statusCode !== 200) {
        error = new Error(' * Error fetching nameserver list.\n' +
                          ` Status Code: ${statusCode}`);
      }

      if (error) {
        console.error(error.message);
        res.resume();
        return;
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          fs.writeFile('nameservers.txt', rawData, (err) => {
            if (err) {
              console.error(` * Error saving nameserver list: ${err.message}`);
              return;
            }

            console.log(chalk.grey(' Download ') + chalk.green('successful') + chalk.grey('!'));
            this.needsVerify = true;
            this.load();
          });
        } catch (e) {
          console.error(` * Error saving nameserver list: ${e.message}`);
        }
      });
    }).on('error', (e) => {
      console.error(` * Error fetching nameserver list: ${e.message}`);
    });
  }

  verifyAll () {
    console.log('');
    console.log(chalk.red(' Verifying integrity of list (pass ') + chalk.grey(this.verifPasses) + chalk.red(' of ') + chalk.grey(this.verifMaxPasses) + chalk.red(')') + chalk.grey(', this may take a moment. . .'));
    console.log('');

    this.genVerifySub();

    this.verifDns = new DnsHandler(this.verifyTld[this.verifiedCount], this.verifyDns, this.udpTimeout, function (n,d) { this.verificationReady(n,d); }.bind(this));
    this.verifDns.test(this.verifySub);
  }

  genVerifySub () {
    for (let i = 0; i < 14; i++)
      this.verifySub += "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 26));
  }

  verificationReady (dns, data) {
    if (data.err !== 'No answer') { // somehow we generated a valid subdomain
      this.verifySub = '';
      this.genVerifySub();
      this.verifDns.test(this.verifySub);
      return;
    }

    this.verifDns = null;

    this.verifiedInterval = setInterval(function () {
      console.log(chalk.grey(' Verified ') + chalk.magenta(this.verifiedCount) + chalk.grey(' out of ') + chalk.magenta(this.nsList.length));
    }.bind(this), 3000);

    for (let i = 0; i < this.nsList.length; i++) {
      this.verifiers[i] = new DnsHandler(this.verifyTld[this.verifiedCount], this.nsList[i], this.udpTimeout, function (n,d) { this.verificationReply(n,d); }.bind(this));
      this.verifiers[i].test(this.verifySub);
    }
  }

  verificationReply (dns, data) {
    this.verifiedCount++;

    if (data.err === 'No answer') {
      this.verifiedList.push(data.ns);
    }

    if (this.verifiedCount === this.nsList.length) {
      this.verificationDone();
    }
  }

  verificationDone () {
    clearInterval(this.verifiedInterval);
    this.verifPasses++;

    if (this.verifPasses !== this.verifMaxPasses) {
      setTimeout(() => {
        this.verifySub = '';
        this.nsList = [];
        this.nsList = this.verifiedList.slice(0);
        this.verifiedList = [];
        this.verifiers = [];
        this.verifiedCount = 0;
        this.verifyAll();
      }, 1);
      return;
    }
    console.log('');
    console.log(chalk.magenta(' Finished ') + chalk.grey(' integrity check, found ') + chalk.magenta(this.verifiedList.length) + chalk.grey(' valid servers.'));

    this.nsList = [];
    this.verifiers = [];

    try {
      fs.writeFile('nameservers.txt', this.verifiedList.join("\n"), (err) => {
        if (err) {
          console.error(` * Error saving nameserver list: ${err.message}`);
          return;
        }

        this.verifiedList = [];
        this.load();
      });
    } catch (e) {
      console.error(` * Error saving nameserver list: ${e.message}`);
    }
  }

  getDnsIp () {
    return this.nsList[ Math.floor( Math.random() * this.nsList.length ) ];
  }
}

module.exports = OpenDns;
