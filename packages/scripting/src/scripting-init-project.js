#!/usr/bin/env node
/*
 * File: ns-init-project.js
 * File Created: Wednesday, 30th January 2019 5:44:01 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

const program = require('commander');

const logger = console;

program
  .version('1.0.0')
  .option('-L, --no-eslint', 'add eslint files')
  .option('-E, --no-editor-config', 'add editor configs')
  .option('-G, --no-git-files', 'add git related files')
  .option('-b, --babel-support', 'add babel build support')
  .parse(process.argv);

const { exec } = require('./common/util');

logger.info('eslint', program.eslint);
logger.info('editor-cofnig', program.editorConfig);
logger.info('git-files', program.gitFiles);

const init = async ({ bNoEslint, bNoEditorConfig, bNoGit } = {}) => {
  if (!bNoEslint) {
  }
  if (!bNoEditorConfig) {
  }
  if (!bNoGit) {
  }
};

exports.init = init;
