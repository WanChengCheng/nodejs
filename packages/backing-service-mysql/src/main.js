/*
 * File: main.js
 * File Created: Wednesday, 6th March 2019 4:09:07 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import connectMysql from './connect';

export const ResourceKey = 'resource/sequelize/mysql';

export const DefaultMeta = {};

export const DefaultConfig = {
  host: process.env.SERVICE_MYSQL_HOST,
  port: process.env.SERVICE_MYSQL_PORT,
  dbname: process.env.SERVICE_MYSQL_DBNAME,
  username: process.env.SERVICE_MYSQL_USERNAME,
  password: process.env.SERVICE_MYSQL_PASSWORD,
};

const connector = (meta = DefaultMeta) => (...configs) => ({
  key: meta.key || ResourceKey,
  connect: () => connectMysql(meta)(...configs),
});

export default connector;
