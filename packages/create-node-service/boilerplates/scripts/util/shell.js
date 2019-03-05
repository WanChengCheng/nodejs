/*
 * File: shell.js
 * File Created: Saturday, 8th December 2018 6:23:58 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

const { spawn } = require('child_process');
const logger = require('pino')({
  prettyPrint: { colorize: true },
});

const run = torun => new Promise((resolve, reject) => {
  const command = spawn(torun, {
    shell: true,
  });
  command.stdout.on('data', (data) => {
    logger.info(`${data}`);
  });
  command.stderr.on('data', (data) => {
    logger.error(`${data}`);
  });
  command.on('close', (code) => {
    if (!code) {
      resolve();
    } else {
      logger.info(`complete with code ${code}`);
      reject(code);
    }
  });
});

module.exports = run;
