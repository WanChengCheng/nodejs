/*
 * File: ava.config.js
 * File Created: Wednesday, 7th November 2018 2:34:23 am
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

export default {
  files: [
    // unit test
    'build/**/*.test.js',
    // e2e test
    'build/**/*.e2e.js',
    // ah, if you like
    'build/**/*.spec.js',
    //
    '!**/exclude-this-file.js',
  ],
  // in watch mode, do not re-run tests when code change,
  //    trigger the re-run with 'yarn build' or 'yarn build:watch'
  sources: ['!server/**/*.js', 'build/**/*.js'],
};
