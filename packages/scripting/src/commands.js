#!/usr/bin/env node
/*
 * File: commands.js
 * File Created: Wednesday, 30th January 2019 5:08:56 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const program = require('commander');
const { exec } = require('./common/util');

program.version('1.0.0');

const logger = console;

program
  .command('setup')
  .description('run setup commands for project')
  .option('-b, --build', 'add babel support')
  .option('-t, --test [lib]', 'add test support', 'ava')
  .option('-l, --lint', 'add eslint support')
  .option('-e, --editorconfig', 'add editor config')
  .option('-g, --git', 'add git related files')
  .option('-s, --sample', 'add sample files')
  .action(async (options) => {
    const {
      build, test, lint, git, editorconfig, sample,
    } = options;
    const copyFiles = [];
    if (build) {
      copyFiles.push(['../configs/babel/babel.config.js', './babel.config.js']);
    }
    if (test) {
      if (test === 'ava') {
        logger.info('Add ava test support...');
        copyFiles.push(['../configs/ava/ava.config.js', './ava.config.js']);
        await exec('yarn add -D ava');
      }
    }
    if (editorconfig) {
      copyFiles.push(['../configs/editor-config/.editorconfig', './.editorconfig']);
    }
    if (git) {
      copyFiles.push(['../configs/git/.gitignore', './.gitignore']);
    }
    await Promise.all(
      copyFiles.map(([from, to]) => promisify(fs.copyFile)(path.join(__dirname, from), to)),
    );
    if (lint) {
      // run yarn add -D @chengchengw/eslint-config &&  npx @chengchengw/eslint-config init
      logger.info('Add lint configs...');
      await exec('yarn add -D @chengchengw/eslint-config');
      logger.info('@chengchengw/eslint-config init ...');
      await exec('npx @chengchengw/eslint-config init');
    }
    if (sample) {
      await fs.ensureDir('./src');
      await fs.copyFile(path.join(__dirname, '../configs/ava/main.js'), './src/main.js');
      await fs.copyFile(path.join(__dirname, '../configs/ava/main.test.js'), './src/main.test.js');
    }
    logger.info('done');
  });

program
  .command('exec <cmd>')
  .alias('ex')
  .description('execute the given remote cmd')
  .option('-e, --exec_mode <mode>', 'Which exec mode to use')
  .action((cmd, options) => {
    console.log('exec "%s" using %s mode', cmd, options.exec_mode);
  });

program.parse(process.argv);
