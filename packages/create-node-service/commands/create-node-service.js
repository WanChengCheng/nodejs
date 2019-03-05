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
const randomize = require('randomatic');
const handlebar = require('handlebars');
const util = require('util');

const read = promisify(fs.readFile);
const write = promisify(fs.writeFile);
const exec = util.promisify(require('child_process').exec);

const logger = console;

const args = yargs
  .command('setup', 'setup project directoy add configure files', {
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
    tools: {
      describe: 'add build, lint test tools',
      default: true,
    },
    env: {
      alias: 'e',
      default: true,
      describe: 'add .env file to root directory',
    },
    version: {
      alias: 'v',
      describe: 'version of the api',
    },
    port: {
      alias: 'p',
      default: 80,
      describe: 'port of the service (in container)',
    },
    name: {
      alias: 'n',
      describe: 'name of the service',
    },
    secret: {
      alias: 's',
      describe: 'generate secret for jwt signer',
    },
    sample: {
      alias: 'c',
      default: true,
      describe: 'generate sample code',
    },
  })
  .help().argv;

const [command] = args._;
/* eslint global-require: 0 */

const setupDockerEnv = async () => {
  const {
    oss, docker, mongo, mysql, redis, env, version, name, port, secret,
  } = args;
  if (!docker) {
    return null;
  }
  const pkg = await readPkg({});
  const serviceName = name || pkg.name;
  const serviceVersion = version || '1.0.0';
  logger.info('Setup docker envirnment, copy docker configs ...');
  await fs.ensureDir('./docker');
  await fs.ensureDir('./configs');
  if (mongo) {
    await fs.ensureDir('./import/mongo');
  }
  if (mysql) {
    await fs.ensureDir('./import/mysql');
  }
  const compose = await read(
    path.join(__dirname, '../boilerplates/docker/docker-compose-dev.yml'),
    'utf8',
  );
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
  if (env) {
    copyFiles.push(['../boilerplates/configs/sample.env', './configs/sample.env']);
  }
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
  fs.copyFileSync(path.join(__dirname, '../boilerplates/docker/Dockerfile'), './Dockerfile');
  if (env) {
    logger.info('Write env files to project root directory ...');
    const envSample = await read(
      path.join(__dirname, '../boilerplates/configs/sample.env'),
      'utf8',
    );
    const envTemplate = handlebar.compile(envSample);
    await write(
      './.env',
      envTemplate({
        use_mongo: mongo,
        use_redis: redis,
        use_oss: oss,
        use_mysql: mysql,
        version: serviceVersion,
        port,
        name: serviceName,
        secret: secret || randomize('Aa0', 20),
      }),
    );
  }
  return true;
};

const addScriptsToPKGJson = async () => {
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
      'dev:empty': `npx @chengchengw/node-service --n ${pkg.name}`,
      'dev:rebuild': `npx @chengchengw/node-service rebuild-app ${pkg.name}`,
      stop: 'docker stop $(docker ps -aq)',
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

const setupLintBuildTestTools = async () => {
  const { tools } = args;
  if (!tools) {
    return null;
  }
  logger.info('Config with @chengchengw/scripting setup -gbtl ...');
  await exec('npx @chengchengw/scripting setup -gbtl');
  const gitExist = await util.promisify(fs.pathExists)('./.git');
  if (!gitExist) {
    logger.info('Init git repositoy: git init ...');
    await exec('git init');
  }
  await addScriptsToPKGJson();
  return true;
};

const addSampleCode = async () => {
  const { sample } = args;
  if (!sample) {
    return null;
  }
  logger.info('Add sample code .');
  await fs.ensureDir('./server/backing-services');
  const copyFiles = [
    ['../boilerplates/server/backing-services/index.js', './server/backing-services/index.js'],
    ['../boilerplates/server/index.js', './server/index.js'],
    ['../boilerplates/server.js', './server.js'],
  ];
  copyFiles.forEach(([from, to]) => {
    fs.copyFileSync(path.join(__dirname, from), to);
  });
  return true;
};

const addDependencies = async () => {
  logger.info('Add dependencies ...');
  await exec('yarn add @chengchengw/node-service');
  await exec('yarn add @chengchengw/backing-service-common');
  await exec('yarn add @chengchengw/backing-service-mongodb');
};

const setup = async () => {
  await setupDockerEnv();
  await setupLintBuildTestTools();
  await addSampleCode();
  await addDependencies();
};

if (command === 'setup') {
  setup();
}
