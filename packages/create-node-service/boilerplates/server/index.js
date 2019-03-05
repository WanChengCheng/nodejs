/*
 * File: index.js
 * File Created: Monday, 4th March 2019 3:02:53 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

import createService, { bootstrapServer } from '@chengchengw/node-service/lib/express/server';
import configCors from '@chengchengw/node-service/lib/express/configCors';
import createAuthMiddleware, {
  multitenancy,
} from '@chengchengw/node-service/lib/express/authentication';
import connect from './backing-services';

export const { service, server, logger } = createService({
  corsSetting: configCors({
    whitelist: ['*'],
  }),
});

const {
  SERVICE_NAME: serviceName,
  SERVICE_JWT_ISSUER: jwtIssuer,
  SERVICE_JWT_SECRET: jwtSecret,
} = process.env;
const { authorized, unauthorized } = createAuthMiddleware({
  jwtSecret: multitenancy(() => Promise.resolve([
    {
      name: serviceName,
      issuer: jwtIssuer,
      secret: jwtSecret,
    },
  ])),
  publicPath: ['/auth', '/api/status'],
});

service.use(authorized);
service.use(unauthorized);

bootstrapServer({
  server,
  logger,
  isTestEnv: process.env.NODE_ENV === 'test',
  noListen: Boolean(process.env.NO_LISTEN),
  connectResources: connect({ logger }),
});

export default server;
