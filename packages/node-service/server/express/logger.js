/*
 * File: logger.js
 * File Created: Monday, 5th November 2018 6:34:46 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */
import pino from 'pino';
import { wrapRequestSerializer } from 'pino-std-serializers';
import { reduce, dissocPath } from 'ramda';

export const createPinoLogger = ({
  isProductionEnv = () => process.env.NODE_ENV === 'production',
  pinoDevOpts = {},
} = {}) => {
  const isProduction = isProductionEnv();
  const logger = pino({
    prettyPrint: !isProduction ? { translateTime: true, colorize: true, ...pinoDevOpts } : false,
  });
  return logger;
};

export const cleanupedPinoRequestSerializer = (
  paths = [['headers', 'authorization'], ['headers', 'cookie']],
) => wrapRequestSerializer((req) => reduce((json, path) => dissocPath(path, json), req, paths));

export default createPinoLogger;
