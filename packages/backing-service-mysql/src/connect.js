/*
 * File: connect.js
 * File Created: Wednesday, 6th March 2019 4:09:14 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import Sequelize from 'sequelize';

const connectMysql = ({
  isProductionEnv = () => process.env.NODE_ENV === 'production',
  logger = console,
} = {}) => ({
  dbname,
  username,
  password,
  host,
  port,
  dialect = 'mysql',
  timezone = '+08:00',
  // http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html
  // ! more options to pass through
  options = {},
}) => new Promise((resolve, reject) => {
  const isProduction = isProductionEnv();
  // ! set default host/port/dbname/username for development env
  // ! check configs/docker-compose-dev.yml for the valuse
  const config = {
    host: host || (!isProduction && 'mysql') || '',
    port: port || (!isProduction && '3306') || '',
    dialect,
    timezone,
    logging: msg => logger.info(msg),
    ...options,
    // https://github.com/sequelize/sequelize/issues/8417
    // ! Using Sequelize without any aliases improves security
    // ! see http://docs.sequelizejs.com/manual/tutorial/querying.html#operators-security
    operatorsAliases: Sequelize.Op,
  };
  const sequelize = new Sequelize(
    dbname || (!isProductionEnv && 'default') || '',
    username || (!isProductionEnv && 'root') || '',
    password,
    config,
  );
  sequelize.authenticate().then(() => resolve(sequelize)).catch(err => reject(err));
});

export default connectMysql;
