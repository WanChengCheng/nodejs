/*
 * File: index.js
 * File Created: Tuesday, 5th March 2019 11:30:55 am
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import connectMongodb from '@chengchengw/backing-service-mongodb';
import connectResource from '@chengchengw/backing-service-common/lib/connectResources';

const connect = ({ logger } = {}) => () => connectResource({
  connectors: [connectMongodb],
  logger,
});

export default connect;