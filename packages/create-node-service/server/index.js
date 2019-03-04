/*
 * File: index.js
 * File Created: Monday, 4th March 2019 3:02:53 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import { server, service } from '@chengchengw/node-service';

const { authorized, unauthorized } = generateAuthMiddleware({
  jwtSecret: multitenancy(serviceIdentities),
  publicPath: ['/auth', '/api/status'],
});

service.use(authorized);
service.use(unauthorized);

export default server;
