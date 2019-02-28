/*
 * File: mongo.js
 * File Created: Monday, 5th November 2018 6:34:21 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

import mongoose from 'mongoose';
import { isProductionEnv } from '../utils/env';

const connectMongo = ({
  nodes = [], replset, user, pass, dbname: customDbname,
}) => {
  const dbname = customDbname || (!isProductionEnv && 'test') || '';
  const servers = nodes.reduce((res, val) => {
    const construction = typeof val;
    if (construction === 'string') {
      res.push(val);
    } else if (construction === 'object') {
      res.push(`${val.host}:${val.port}`);
    } else {
      throw Error(`Unknown node config format:${val}`);
    }
    return res;
  }, []);
  // ! set default values for development
  // ! check configs/docker-compose-dev.yml for the values
  //  host should be mongo,
  //  port should be 27017
  //  see configs/docker-compose-dev.yml
  if (!servers.length && !isProductionEnv) {
    servers.push('mongo:27017');
  }
  const opt = {};
  if (replset) {
    opt.replicaSet = replset;
  }
  const uri = `mongodb://${servers.join(',')}/${dbname}`;
  const conn = mongoose.createConnection(uri, {
    user,
    pass,
    // keepAlive is true by default since mongoose 5.2.0
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    // How long the MongoDB driver will wait before failing its initial connection attempt.
    connectTimeoutMS: 30000,
    useCreateIndex: true,
    useNewUrlParser: true,
    ...opt,
  });
  return conn;
};

export default connectMongo;
