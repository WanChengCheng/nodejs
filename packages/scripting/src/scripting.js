#!/usr/bin/env node
/*
 * File: ns.js
 * File Created: Wednesday, 30th January 2019 5:08:56 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

const program = require('commander');

program
  .version('1.0.0')
  .command('create-project', 'create an empty node project with default settings')
  .parse(process.argv);
