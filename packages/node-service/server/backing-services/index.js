/*
 * File: index.js
 * File Created: Friday, 9th November 2018 1:04:54 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

export const MongoDBService = 'backing-service-mongodb';
export const RedisService = 'backing-service-redis';
export const MySQLService = 'backing-service-rds-mysql';

const BackingServiceManager = (() => {
  const storage = {};
  return {
    register: (serviceKey, serviceInstance) => {
      storage[serviceKey] = serviceInstance;
    },
    service: serviceKey => storage[serviceKey],
  };
})();

export default BackingServiceManager;
