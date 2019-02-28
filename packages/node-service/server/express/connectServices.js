/*
 * File: connectServices.js
 * File Created: Monday, 5th November 2018 7:36:06 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

import connectMongo from '../backing-services/mongo';
import connectRedis from '../backing-services/redis';
import connectMysql from '../backing-services/mysql';
import serviceRegister, { MongoDBService, RedisService, MySQLService } from '../backing-services';
import logger from '../utils/logger';

const log = logger.child({ context: '[Connect Service]' });

// return mongodb connection
export const connectMongoWithEnvConfig = () => new Promise((resolve, reject) => {
  log.info('connecting mongo');
  const mongoConnection = connectMongo({
    nodes: JSON.parse(process.env.SERVICE_MONGO_NODES || null) || [],
    replset: process.env.SERVICE_MONGO_REPLSET,
    dbname: process.env.SERVICE_MONGO_DB_NAME,
    user: process.env.SERVICE_MONGO_USERNAME,
    pass: process.env.SERVICE_MONGO_PASSWORD,
  });
  serviceRegister.register(MongoDBService, mongoConnection);
  mongoConnection.on('connected', () => {
    log.info('mongodb connected');
    resolve();
  });
  mongoConnection.on('error', (err) => {
    log.error(err, 'connect mongodb error');
    reject(err);
  });
});

//  return ioredis instance
export const connectRedisWithEnvConfig = () => new Promise((resolve, reject) => {
  log.info('connecting redis');
  const redis = connectRedis({
    host: process.env.SERVICE_REDIS_HOST,
    port: process.env.SERVICE_REDIS_PORT,
    password: process.env.SERVICE_REDIS_PASSWORD,
  });
  serviceRegister.register(RedisService, redis);
  redis.on('ready', () => {
    log.info('redis connected');
    resolve();
  });
  redis.on('error', (err) => {
    log.error(err, 'connect redis error');
    reject(err);
  });
});

//  return sequelize instance
export const connectMysqlWithEnvConfig = () => new Promise((resolve, reject) => {
  log.info('connecting mysql');
  const sequelize = connectMysql({
    host: process.env.SERVICE_MYSQL_HOST,
    port: process.env.SERVICE_MYSQL_PORT,
    dbname: process.env.SERVICE_MYSQL_DBNAME,
    username: process.env.SERVICE_MYSQL_USERNAME,
    password: process.env.SERVICE_MYSQL_PASSWORD,
  });
  serviceRegister.register(MySQLService, sequelize);
  sequelize
    .authenticate()
    .then(() => {
      log.info('mysql connected');
      resolve();
    })
    .catch((err) => {
      log.error(err, 'connect mysql error');
      reject(err);
    });
});

const connectServices = () => [
  //
  // ─── CONNECT MONGODB ────────────────────────────────────────────────────────────
  //
  connectMongoWithEnvConfig(),
  //
  // ─── CONNECT REDIS ──────────────────────────────────────────────────────────────
  //
  connectRedisWithEnvConfig(),
  //
  // ─── CONNECT MYSQL ──────────────────────────────────────────────────────────────
  //
  connectMysqlWithEnvConfig(),
];

export default connectServices;
