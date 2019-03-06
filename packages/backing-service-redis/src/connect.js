/*
 * File: connect.js
 * File Created: Wednesday, 6th March 2019 4:32:33 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import Redis from 'ioredis';

const connectRedis = ({ isProductionEnv = () => process.env.NODE_ENV === 'production' } = {}) => ({
  host,
  port,
  password,
  // Select the Redis logical database having the specified zero-based numeric index.
  //  New connections always use the database 0.
  db = 0,
}) => new Promise((resolve, reject) => {
  const isProduction = isProductionEnv();
  const config = {
    // ! set default values for deveopment env
    // ! check configs/docker-compose-dev.yml for the values
    // default to a host name 'redis'
    host: host || (!isProduction && 'redis') || '',
    // default port of redis as convention
    port: port || (!isProduction && '6379') || '',
    db,
    retryStrategy: times => Math.min(10 * 60 * 1000, times * 10 * 1000),
  };
  if (password) {
    config.password = password;
  }
  const redis = new Redis(config);
  redis.on('connect', () => resolve(redis));
  redis.on('error', err => reject(err));
});

export default connectRedis;
