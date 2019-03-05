/*
 * File: resourceRegister.js
 * File Created: Tuesday, 5th March 2019 11:03:39 am
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

const resourceRegister = (() => {
  const storage = {};
  return {
    register: (serviceKey, serviceInstance) => {
      storage[serviceKey] = serviceInstance;
    },
    service: serviceKey => storage[serviceKey],
  };
})();

export default resourceRegister;
