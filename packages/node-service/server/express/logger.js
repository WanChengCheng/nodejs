/*
 * File: logger.js
 * File Created: Monday, 5th November 2018 6:34:46 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */
import pino from 'pino';

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

export default createPinoLogger;
