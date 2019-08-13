/*
 * File: connection.js
 * File Created: Tuesday, 13th August 2019 2:40:49 pm
 * Author: ChengCheng Wan <chengcheng.st@gmail.com>
 */

export const register = (() => {
  const memcache = {};
  return {
    get: (name) => memcache[name],
    set: (name, model) => {
      memcache[name] = model;
    },
  };
})();

const connect = (mongoConnection) => ({
  name, schema, collection, discriminator,
}) => {
  if (register.get(name)) {
    // resolving event loop pending model connection, prevent duplicated discriminator call
    return register.get(name);
  }
  if (discriminator) {
    return register.get(discriminator).discriminator(name, schema);
  }
  return mongoConnection.model(name, schema, collection);
};

const connectMongooseModel = (defination, connector) => async () => {
  const { name, discriminator } = defination;
  if (discriminator && !register.get(discriminator)) {
    throw Error(
      `Please make sure base schema initialized before discrimination, ${discriminator} <= ${name}`,
    );
  }
  if (register.get(name)) {
    return register.get(name);
  }
  const connection = await useService(connector);
  register.set(name, connect(connection)(defination));
  return register.get(name);
};

// eslint-disable-next-line max-len
export const postponeConnectionTill = (dependentConnector) => (def, connector) => async () => dependentConnector().then(() => connectMongooseModel(def, connector)());

export default connectMongooseModel;
