#!/usr/bin/env node
/*
 * File: create-node-service.js
 * File Created: Tuesday, 29th January 2019 7:43:59 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

const yargs = require('yargs');
const fs = require('fs-extra');
const path = require('path');

const args = yargs
  .command('init', 'init project directoy add configure files', {
    scripts: {
      describe: 'add npm scripts',
      default: true,
    },
    script: {
      descripbe: 'alias for scripts',
      default: true,
    },
    docker: {
      describe: 'add docker related files',
      default: true,
    },
    mock: {
      describe: 'add import storage data',
      default: true,
    },
    mongo: {
      describe: 'add mongo related config & boilerplates',
      default: true,
    },
    redis: {
      describe: 'add redis related config & boilerplates',
      default: true,
    },
    mysql: {
      describe: 'add mysql(sequelize) related config & boilerplates',
      default: true,
    },
    oss: {
      describe: 'add oss related configs & boilerplates',
      default: true,
    },
    env: {
      alias: 'e',
      describe: 'add .env file to root directory',
    },
    name: {
      alias: 'n',
      describe: 'name of the service',
      default: 'node-service',
    },
    secret: {
      alias: 's',
      describe: 'generate secret for jwt signer',
    },
  })
  .help().argv;

const [command] = args._;
/* eslint global-require: 0 */
if (command === 'init') {
  const { scripts, docker, mock } = args;
}
console.info(args);
