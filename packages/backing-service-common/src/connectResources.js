/*
 * File: connectResources.js
 * File Created: Monday, 4th March 2019 6:58:37 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import serviceRegister from './resourceRegister';

const connectingResource = ({ connectors, logger = console, register = serviceRegister }) => Promise.all(
  connectors.map((connector) => {
    const { connect, key } = connector;
    if (!key || typeof connect !== 'function') {
      throw Error('Invalid connector provided');
    }
    return connect()
      .then((resource) => {
        logger.info(`${key} connected.`);
        register.register(key, resource);
      })
      .catch((err) => {
        logger.error(`${key} failed to connect, reason:${err.message}`);
        throw err;
      });
  }),
).then(() => register);

export default connectingResource;
