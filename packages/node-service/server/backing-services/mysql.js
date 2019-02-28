/*
 * File: mysql.js
 * File Created: Tuesday, 6th November 2018 12:09:34 am
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

import Sequelize from 'sequelize';
import logger from '../utils/logger';
import { isProductionEnv } from '../utils/env';

const log = logger.child({ context: '[Sequelize]' });

const connectMysql = ({
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
}) => {
  // ! set default host/port/dbname/username for development env
  // ! check configs/docker-compose-dev.yml for the valuse
  const config = {
    host: host || (!isProductionEnv && 'mysql') || '',
    port: port || (!isProductionEnv && '3306') || '',
    dialect,
    timezone,
    logging: msg => log.info(msg),
    ...options,
    // https://github.com/sequelize/sequelize/issues/8417
    // ! Using Sequelize without any aliases improves security
    // ! see http://docs.sequelizejs.com/manual/tutorial/querying.html#operators-security
    operatorsAliases: Sequelize.Op,
  };
  return new Sequelize(
    dbname || (!isProductionEnv && 'default') || '',
    username || (!isProductionEnv && 'root') || '',
    password,
    config,
  );
};

export default connectMysql;
