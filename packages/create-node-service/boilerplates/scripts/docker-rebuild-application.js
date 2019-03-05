#!/usr/bin/env node
/*
 * File: docker-rebuild-application.js
 * File Created: Tuesday, 6th November 2018 10:35:34 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

require('dotenv').config();

const logger = require('pino')({
  prettyPrint: { colorize: true },
});

const project = process.env.SERVICE_NAME;

require('./util/shell')(`docker rm -f ${project}; docker rmi ${project}`)
  .catch(() => {})
  .then(() => {
    logger.info('rebuild application:');
  });
