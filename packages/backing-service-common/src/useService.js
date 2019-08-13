/*
 * File: useService.js
 * File Created: Tuesday, 13th August 2019 2:47:43 pm
 * Author: ChengCheng Wan <chengcheng.st@gmail.com>
 */
import services from './resourceRegister';

export default async (connector) => {
  const connected = services.resource(connector.key);
  if (!connected) {
    const resource = await connector.connect();
    services.register(connector.key, resource);
  }
  return services.resource(connector.key);
};
