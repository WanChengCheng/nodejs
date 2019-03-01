#!/usr/bin/env node
/*
 * File: index.js
 * File Created: Friday, 1st March 2019 6:15:53 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

const path = require('path');
const yargs = require('yargs');

const logger = console;

const args = yargs
  .command('sign-token', 'sign jwt token for development', {
    env: {
      alias: 'e',
      default: './.env',
    },
    iss: {
      alias: 'i',
      default: '',
    },
    secret: {
      alias: 's',
      default: '',
    },
    payload: {
      alias: 'p',
      default: 'usage:dev',
    },
    ttl: {
      alias: 't',
      default: '1d',
    },
  })
  .command('clear-app <name>', 'remove app docker container and image for rebuild', {
    name: {
      alias: 'n',
      describe: 'name of the project to remove',
      demandOption: true,
    },
  })
  .command('clear-service', 'remove dependent backing service', {
    name: {
      alias: 'n',
      describe: 'name of the project',
      demandOption: true,
    },
    mongo: {
      alias: 'm',
      describe: 'remove mongo related containers/images',
    },
    all: {
      alias: 'a',
      describe: 'try remove all the provided service containers/images',
    },
    redis: {
      alias: 'r',
      describe: 'try remove redis related containers/images',
    },
    mysql: {
      describe: 'try remove mysql related containers/images',
    },
  })
  .help().argv;

const [command] = args._;

/* eslint global-require: 0 */

if (command === 'sign-token') {
  const {
    env, iss, secret, payload, ttl,
  } = args;
  require('dotenv').config({
    path: path.join(__dirname, env),
  });
  const jwt = require('jsonwebtoken');
  const content = payload.split(',').reduce((res, str) => {
    const [k, v] = str.split(':');
    if (k && v) {
      res[k] = v;
    }
    return res;
  }, {});
  const sign = () => new Promise((resolve, reject) => {
    jwt.sign(
      { ...content },
      secret,
      {
        expiresIn: ttl,
        issuer: iss,
      },
      (err, token) => (err ? reject(err) : resolve(token)),
    );
  });
  sign().then(token => logger.info(`\nAuthorization: Bearer ${token}`));
}

if (command === 'clear-app') {
  const { name } = args;
  require('./shell')(`docker rm -f ${name}; docker rmi ${name}`)
    .catch(() => {})
    .then(() => {
      logger.info('app docker container&image removed.');
    });
}

if (command === 'clear-service') {
  const {
    name, all, mongo, mysql, redis,
  } = args;
  const storage = [];
  if (all) {
    storage.push(...['mongo', 'mongoimport', 'redis', 'mysql']);
  } else {
    if (mongo) {
      storage.push('mongo', 'mongoimport');
    }
    if (mysql) {
      storage.push('mysql');
    }
    if (redis) {
      storage.push('redis');
    }
  }
  const removeContainers = `docker rm -f ${storage.map(item => `${name}-${item}`).join(' ')}`;
  const removeImages = `docker rmi ${name}-mongoimport`;

  require('./shell')(`${removeContainers};${removeImages}`)
    .then(() => {
      logger.info('complete');
    })
    .catch(() => {});
}
