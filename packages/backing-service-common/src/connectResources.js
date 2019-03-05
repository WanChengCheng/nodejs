/*
 * File: connectResources.js
 * File Created: Monday, 4th March 2019 6:58:37 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import serviceRegister from './resourceRegister';

const connectingResource = connectors => Promise.all(
  connectors.map((connector) => {
    const { connect, key } = connector;
    if (!key || typeof connect !== 'function') {
      throw Error('Invalid connector provided');
    }
    return connect().then((resource) => {
      serviceRegister.register(key, resource);
    });
  }),
);

export default connectingResource;
