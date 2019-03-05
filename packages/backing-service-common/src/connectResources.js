/*
 * File: connectResources.js
 * File Created: Monday, 4th March 2019 6:58:37 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import serviceRegister from './resourceRegister';

const connectingResource = ({ connectors, logger = console }) => Promise.all(
  connectors.map((connector) => {
    const { connect, key } = connector;
    if (!key || typeof connect !== 'function') {
      throw Error('Invalid connector provided');
    }
    logger.info(connect);
    const result = connect();
    logger.info('tyoeof result:', typeof result);
    return connect()
      .then((resource) => {
        logger(`${key} connected.`);
        serviceRegister.register(key, resource);
      })
      .catch((err) => {
        logger(`${key} failed to connect, reason:${err.message}`);
        throw err;
      });
  }),
).then(() => serviceRegister);

export default connectingResource;
