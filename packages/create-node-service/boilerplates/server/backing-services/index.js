/*
 * File: index.js
 * File Created: Tuesday, 5th March 2019 11:30:55 am
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import connectMongodb, {
  DefaultConfig as mongoDefaultConfig,
} from '@chengchengw/backing-service-mongodb';
import connectOSS, { DefaultConfig as ossDefaultConfig } from '@chengchengw/backing-service-oss';
import connectResource from '@chengchengw/backing-service-common/lib/connectResources';
import register from '@chengchengw/backing-service-common/lib/resourceRegister';

export const mongoConnector = connectMongodb()({ ...mongoDefaultConfig });

export const FlitDefaultOSSKey = 'resource/oss/default-bucket';

export const ossConnector = connectOSS({ key: FlitDefaultOSSKey })({
  ...ossDefaultConfig,
});

const connect = ({ logger } = {}) => () => connectResource({
  connectors: [mongoConnector, ossConnector],
  logger,
  register,
});

export const services = register;

export const useService = async (connector) => {
  const connected = services.service(connector.key);
  if (!connected) {
    const resource = await connector.connect();
    services.register(connector.key, resource);
  }
  return services.service(connector.key);
};

export default connect;
