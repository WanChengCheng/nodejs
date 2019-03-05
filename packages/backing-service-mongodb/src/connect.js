/*
 * File: connect.js
 * File Created: Thursday, 28th February 2019 4:35:09 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import mongoose from 'mongoose';

const connectMongo = ({
  isProductionEnv = () => process.env.NODE_ENV === 'production',
  devDbName = 'test',
  devMongoHost = 'mongo',
  devMongoPort = '27017',
} = {}) => ({
  nodes = [], replset, user, pass, dbname: customDbname,
}) => new Promise((resolve, reject) => {
  const isProduction = isProductionEnv();
  const dbname = (() => {
    if (customDbname) return customDbname;
    if (!isProduction) return devDbName;
    return '';
  })();
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
    // ! check backing-service-common/configs/docker-compose-dev.yml for the values
  if (!servers.length && !isProduction) {
    servers.push(`${devMongoHost}:${devMongoPort}`);
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
    /**
       * By default, Mongoose 5.x calls the MongoDB driver's ensureIndex() function.
       *  The MongoDB driver deprecated this function in favor of createIndex().
       *  Set the useCreateIndex global option to opt in to
       *    making Mongoose use createIndex() instead.
       */
    useCreateIndex: true,
    /**
       * The MongoDB Node.js driver rewrote the tool it uses to parse MongoDB connection strings.
       *  Because this is such a big change, they put the new connection string parser behind a flag.
       *  To turn on this option, pass the useNewUrlParser option to mongoose.connect()
       *    or mongoose.createConnection().
       */
    useNewUrlParser: true,
    ...opt,
  });
  conn.on('connected', () => {
    resolve(conn);
  });
  conn.on('error', (err) => {
    reject(err);
  });
  return conn;
});

export default connectMongo;
