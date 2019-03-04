/*
 * File: redis.js
 * File Created: Monday, 4th March 2019 2:17:16 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import connectRedis from '@chengchengw/backing-service-redis';

const configs = (() => {
  const {
    SERVICE_REDIS_HOST: host,
    SERVICE_REDIS_PORT: port,
    SERVICE_REDIS_PASSWORD: password,
  } = process.env;
  return {
    host,
    port,
    password,
  };
})();

const ioredis = connectRedis()(configs);

export default ioredis;
