/*
 * File: connection.js
 * File Created: Tuesday, 13th August 2019 3:57:50 pm
 * Author: ChengCheng Wan <chengcheng.st@gmail.com>
 */
import { curry } from 'ramda';

const register = (() => {
  const memcache = {};
  return {
    get: (name) => memcache[name],
    set: (name, model) => {
      memcache[name] = model;
    },
  };
})();

// eslint-disable-next-line max-len
const connect = curry((sequelize, { name, schema, options = {} }) => sequelize.define(name, schema, options));

export const shardedSequelizeModel = curry(async (getConnection, defination, shard) => {
  const { name } = defination;
  const key = `${name}/shards/${shard}`;
  if (register.get(key)) {
    return register.get(key);
  }
  const connection = await getConnection(shard);
  register.set(name, connect(connection)(defination));
  return register.get(name);
});

export const directSequelizeModel = curry((getConnection, defination) => async () => {
  const { name } = defination;
  if (register.get(name)) {
    return register.get(name);
  }
  const connection = await getConnection();
  register.set(
    name,
    connect(
      connection,
      defination,
    ),
  );
  return register.get(name);
});
