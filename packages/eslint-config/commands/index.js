#!/usr/bin/env node
/*
 * File: index.js
 * File Created: Friday, 1st March 2019 2:33:10 pm
 * Author: ChengCheng Wan <chengcheng.st@gmail.com>
 */

const yargs = require('yargs');
const fs = require('fs-extra');
const path = require('path');

const args = yargs
  .command('init', 'init project directoy add configure files', {
    react: {
      alias: 'r',
    },
  })
  .help().argv;

const executableDir = p => path.join(__dirname, p);

const [command] = args._;
const { exec } = require('child_process');

const logger = console;

if (command === 'init') {
  if (args.react) {
    fs.copySync(executableDir('../configs/.eslintrc.react.js'), './.eslintrc.js');
    exec('npm info "eslint-config-airbnb@latest" peerDependencies', (err, stdout) => {
      logger.info('Peerdependencies to install:', stdout);
    });
  } else {
    fs.copySync(executableDir('../configs/.eslintrc.js'), './.eslintrc.js');
    exec('npm info "eslint-config-airbnb-base@latest" peerDependencies', (err, stdout) => {
      logger.info('Peerdependencies to install:', stdout);
    });
  }

  fs.copySync(executableDir('../configs/.eslintignore'), './.eslintignore');
}
