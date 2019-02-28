/*
 * File: index.js
 * File Created: Monday, 5th November 2018 3:35:34 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

import { server, service } from './express/server';
import api from './api';
import auth, { serviceIdentities } from './auth';
import generateAuthMiddleware, { multitenancy } from './auth/authMiddleware';

const { authorized, unauthorized } = generateAuthMiddleware({
  jwtSecret: multitenancy(serviceIdentities),
  publicPath: ['/auth', '/api/status'],
});

service.use(authorized);
service.use(unauthorized);

service.use('/api', api);
service.use('/auth', auth);

export default server;
