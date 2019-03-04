#!/usr/bin/env node
/*
 * File: create-node-service.js
 * File Created: Tuesday, 29th January 2019 7:43:59 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

const yargs = require('yargs');
const fs = require('fs-extra');
const path = require('path');
const writePkg = require('write-pkg');
const readPkg = require('read-pkg');
const { promisify } = require('util');
const handlebar = require('handlebars');

const read = promisify(fs.readFile);
const write = promisify(fs.writeFile);

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

const initDocker = async () => {
  const {
    docker, mongo, mysql, redis,
  } = args;
  if (!docker) {
    return null;
  }
  await fs.ensureDir('./docker');
  if (mongo) {
    await fs.ensureDir('./import/mongo');
  }
  if (mysql) {
    await fs.ensureDir('./import/mysql');
  }
  const compose = await read(path.join(__dirname, '../docker/docker-compose-dev.yml'), 'utf8');
  const template = handlebar.compile(compose);
  await write(
    './docker/docker-compose-dev.yml',
    template({
      use_mongo: mongo,
      use_redis: redis,
      use_mysql: mysql,
    }),
    'utf8',
  );
  const copyFiles = [];
  if (mongo) {
    copyFiles.push([
      '../boilerplates/docker/Dockerfile-mongoimport',
      './docker/Dockerfile-mongoimport',
    ]);
    copyFiles.push(['../boilerplates/import/mongo/sample.json', './import/mongo/sample.json']);
  }
  if (mysql) {
    copyFiles.push(['../boilerplates/docker/mysql.cnf', './docker/mysql.cnf']);
    copyFiles.push(['../boilerplates/docker/wait-for-it.sh', './docker/wait-for-it.sh']);
    copyFiles.push(['../boilerplates/import/mysql/sample.sql', './import/mysql/sample.sql']);
  }
  copyFiles.forEach(([from, to]) => {
    fs.copyFileSync(path.join(__dirname, from), to);
  });
  fs.copyFileSync(path.join(__dirname, '../docker/Dockerfile'), './Dockerfile');
  return true;
};

const initPackageJSON = async () => {
  const { scripts } = args;
  if (!scripts) {
    return null;
  }
  const pkg = await readPkg({});

  await writePkg({
    ...pkg,
    scripts: {
      dev:
        'DOCKER_CMD="dumb-init npm run start" docker-compose -f docker/docker-compose-dev.yml up',
      'dev:watch':
        'NO_LISTEN=yes DOCKER_CMD="dumb-init npm run start" docker-compose -f docker/docker-compose-dev.yml up',
      'dev:test':
        'NODE_ENV=test DOCKER_CMD="dumb-init npm run test" docker-compose -f docker/docker-compose-dev.yml up --abort-on-container-exit',
      'dev:debug':
        'npm run build && DOCKER_CMD="dumb-init npm run debug" docker-compose -f docker/docker-compose-dev.yml up',
      'dev:empty': 'node scripts/docker-clear-storage',
      'dev:rebuild': 'node scripts/docker-rebuild-application',
      lint: 'eslint server/**',
      debug: 'npm run build && node --inspect-brk=0.0.0.0:8100 server.js',
      test: 'npm run build && ./node_modules/.bin/ava --verbose',
      'test:watch': './node_modules/.bin/ava --verbose --watch',
      'test:e2e': './node_modules/.bin/ava --verbose build/**/*.e2e.js',
      'test:ut': './node_modules/.bin/ava --verbose build/**/*.test.js',
      build: 'if [ -d build ]; then rm -r build/*; fi; npm run build:server',
      'build:noremove': 'npm run build:server',
      'build:server': './node_modules/.bin/babel server --out-dir build --copy-files --source-maps',
      'build:watch': 'nodemon --watch server -x "npm run build:noremove"',
      start: 'npm run build && node server.js',
      'start:nobuild': 'node server.js',
    },
  });
  return true;
};

const initNodeBTL = async () => {
};

const init = async () => {
  await initDocker();
  await initPackageJSON();
};

if (command === 'init') {
  init();
}
