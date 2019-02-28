/*
 * File: logger.js
 * File Created: Monday, 5th November 2018 6:34:46 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */
import pino from 'pino';
import { isProductionEnv } from './env';

const logger = pino({
  prettyPrint: !isProductionEnv ? { translateTime: true, colorize: true } : false,
});

export default logger;
