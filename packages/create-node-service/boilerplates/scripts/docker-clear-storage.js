#!/usr/bin/env node
/*
 * File: docker-clear-storage.js
 * File Created: Tuesday, 6th November 2018 11:29:20 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

require('dotenv').config();
const logger = require('pino')({
  prettyPrint: { colorize: true },
});

const run = require('./util/shell');


const project = process.env.SERVICE_NAME;

const storage = ['mongo', 'mongoimport', 'redis', 'mysql'];

const rmAllContainers = `docker rm -f ${storage.map(item => `${project}-${item}`).join(' ')}`;
const rmMongoImportImage = `docker rmi ${project}-mongoimport`;

// ! remove all the containers
// ! remove mongoImport image, rebuild it from yarn dev
run(`${rmAllContainers};${rmMongoImportImage}`)
  .then(() => {
    logger.info('remove storage:');
  })
  .catch(() => {});
