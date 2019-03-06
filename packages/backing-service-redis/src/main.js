/*
 * File: main.js
 * File Created: Monday, 4th March 2019 8:37:01 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import connectRedis from './connect';

export const ResourceKey = 'resource/ioredis/redis';

export const DefaultMeta = {};

export const DefaultConfig = {
  host: process.env.SERVICE_REDIS_HOST,
  port: process.env.SERVICE_REDIS_PORT,
  password: process.env.SERVICE_REDIS_PASSWORD,
};

const connector = (meta = DefaultMeta) => (...configs) => ({
  key: meta.key || ResourceKey,
  connect: () => connectRedis(meta)(...configs),
});

export default connector;
