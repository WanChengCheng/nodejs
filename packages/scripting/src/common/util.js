/*
 * File: util.js
 * File Created: Wednesday, 30th January 2019 6:04:58 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

const util = require('util');

exports.exec = util.promisify(require('child_process').exec);
