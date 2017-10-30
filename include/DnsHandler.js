/*
  Developer: Marzavec
  Description:
*/

'use strict'

const dns = require('native-dns');
const util = require('util');

class DnsHandler {
  constructor (tld, dnsServer, timeout, callback) {
    this.tld = tld;
    this.dnsServer = dnsServer;
    this.timeout = timeout;
    this.callback = callback;
    this.initialized = false;
  }

  init () {
    this.query = dns.Request({
      question: dns.Question({
        name: (this.curSub || 'www') + '.' + this.tld,
        type: 'A'
      }),

      server: {
        address: this.dnsServer,
        port: 53,
        type: 'udp'
      },

      timeout: this.timeout
    });

    this.query.on('timeout', function () {
      this.fail('Timed out')
    }.bind(this));

    this.query.on('message', function (err, reply) {
      if (err) {
        this.fail(err);
        return;
      }

      if (reply.answer.length === 0) {
        this.fail('No answer');
        return;
      }

      this.success(reply.answer);
    }.bind(this));

    this.initialized = true;
  }

  fail (reason) {
    this.initialized = false;

    // needs preprocessing?
    this.callback(this, {
      err: reason,
      ns: this.dnsServer
    })
  }

  success (result) {
    this.initialized = false;

    this.callback(this, {
      err: false,
      result: result,
      ns: this.dnsServer
    })
  }

  test (subdomain) {
    if (subdomain === false) {
      this.fail('Wordlist empty');
      return;
    }

    this.curSub = subdomain;
    if (this.initialized === false) this.init();

    this.query.question.name = subdomain + '.' + this.tld;
    this.query.send();
  }

  retest () {
    if (this.initialized === false) this.init();

    this.query.send();
  }

  updateNameserver (newDns) {
    this.dnsServer = newDns;
    this.query.server.address = newDns;
  }
}

module.exports = DnsHandler;
