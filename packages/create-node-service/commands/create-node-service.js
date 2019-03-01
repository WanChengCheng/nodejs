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
      alias: 's',
      describe: 'add npm scripts',
    },
    docker: {
      alias: 'd',
      describe: 'add docker related files',
    },
    mock: {
      alias: 'm',
      describe: 'add import storage data',
    },
  })
  .help().argv;

`
  "dev": "DOCKER_CMD=\"dumb-init npm run start\" docker-compose -f docker/docker-compose-dev.yml up",
  "dev:watch": "NO_LISTEN=yes DOCKER_CMD=\"dumb-init npm run start\" docker-compose -f docker/docker-compose-dev.yml up",
  "dev:test": "NODE_ENV=test DOCKER_CMD=\"dumb-init npm run test\" docker-compose -f docker/docker-compose-dev.yml up --abort-on-container-exit",
  "dev:debug": "npm run build && DOCKER_CMD=\"dumb-init npm run debug\" docker-compose -f docker/docker-compose-dev.yml up",
  "dev:empty": "node scripts/docker-clear-storage",
  "dev:rebuild": "node scripts/docker-rebuild-application",
  "lint": "eslint server/**",
  "debug": "npm run build && node --inspect-brk=0.0.0.0:8100 server.js",
  "test": "npm run build && ./node_modules/.bin/ava --verbose",
  "test:watch": "./node_modules/.bin/ava --verbose --watch",
  "test:e2e": "./node_modules/.bin/ava --verbose build/**/*.e2e.js",
  "test:ut": "./node_modules/.bin/ava --verbose build/**/*.test.js",
  "build": "if [ -d build ]; then rm -r build/*; fi; npm run build:server",
  "build:noremove": "npm run build:server",
  "build:server": "./node_modules/.bin/babel server --out-dir build --copy-files --source-maps",
  "build:watch": "nodemon --watch server -x \"npm run build:noremove\"",
  "start": "npm run build && node server.js",
  "start:nobuild": "node server.js"
  `;
