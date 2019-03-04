/*
 * File: mongo.js
 * File Created: Monday, 4th March 2019 12:11:24 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import connectMongo from '@chengchengw/backing-service-mongodb';

const configs = (() => {
  const {
    SERVICE_MONGO_NODES: mongoNodes = '[]',
    SERVICE_MONGO_DB_NAME: dbname = '',
    SERVICE_MONGO_REPLSET: replset = '',
    SERVICE_MONGO_USERNAME: user = '',
    SERVICE_MONGO_PASSWORD: pass = '',
  } = process.env;
  return {
    nodes: JSON.parse(mongoNodes),
    dbname,
    replset,
    user,
    pass,
  };
})();
const connect = connectMongo()(configs);

export default connect;
