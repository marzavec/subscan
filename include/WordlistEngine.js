/*
  Developer: Marzavec
  Description:
*/

'use strict'

const chalk = require('chalk');
const fs = require('fs');

class WordlistEngine {
  constructor (targetFile, readyCallback) {
    this.readyCallback = readyCallback;
    this.list = [];
    this.origLength = 0;

    this.load(targetFile);
  }

  load (targetFile) {
    fs.open(targetFile, 'r', (err, fd) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log(chalk.red(' * Error') + chalk.grey(': cannot find target wordlist file'));
          return;
        }

        throw err;
      }

      this.list = fs.readFileSync(targetFile, 'utf8').split("\n");
      this.origLength = this.list.length;
      console.log(chalk.grey(' Loaded ') + chalk.magenta(this.origLength) + chalk.grey(' words.'));
      console.log('');
      this.readyCallback();
    });
  }

  getNext () {
    if (this.list.length === 0) return false;
    return this.list.pop();
  }
}

module.exports = WordlistEngine;
