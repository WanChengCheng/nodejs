#!/usr/bin/env node
/*
 * File: ns-create-project.js
 * File Created: Wednesday, 30th January 2019 4:26:40 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

const program = require('commander');
const { exec } = require('./common/util');
const { init } = require('./scripting-init-project');

const logger = console;

program
  .version('1.0.0')
  .option('-n, --name [name]', 'name of the project', '')
  .parse(process.argv);

const { name } = program;

const create = folder => exec(`mkdir ${folder}`);

if (!name) {
  logger.error('please specify the name of the project to create');
  process.exit(1);
} else {
  create(name)
    .catch((err) => {
      logger.error(`cannot create folder:${name}`);
      logger.error(err.message);
      process.exit(2);
    })
    .then(() => process.chdir(`./${name}`))
    .then(init)
    .catch((err) => {
      logger.error(err.message);
      process.exit(3);
    });
}

exports.create = create;
