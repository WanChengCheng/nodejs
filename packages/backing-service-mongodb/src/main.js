/*
 * File: main.js
 * File Created: Thursday, 28th February 2019 5:01:33 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import connectMongo from './connect';

export const ServiceKey = 'resource/mongoose/mongo-connection';

export const DefaultMeta = {};

export const DefaultConfig = {
  nodes: JSON.parse(process.env.SERVICE_MONGO_NODES || null) || [],
  replset: process.env.SERVICE_MONGO_REPLSET,
  dbname: process.env.SERVICE_MONGO_DB_NAME,
  user: process.env.SERVICE_MONGO_USERNAME,
  pass: process.env.SERVICE_MONGO_PASSWORD,
};

const connector = (...meta) => (...config) => ({
  key: ServiceKey,
  connect: () => connectMongo(...meta)(...config),
});

export default connector;
