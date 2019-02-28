/*
 * File: index.js
 * File Created: Thursday, 8th November 2018 6:59:06 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

import { Router } from 'express';
// import { body } from 'express-validator/check';
import { tokenSigner } from './authMiddleware';
import { serviceName, jwtIssuer, jwtSecret } from '../utils/env';
import { NotImplementError } from '../errors/codes';
import errorTrigger from '../express/errorTrigger';
import errorResponse from '../express/errorResponse';

const auth = Router();
export const serviceIdentities = () => Promise.resolve([
  {
    name: serviceName,
    issuer: jwtIssuer,
    secret: jwtSecret,
  },
]);

export const signToken = tokenSigner(serviceIdentities)(serviceName);

auth.get('/signup', (req, res) => {
  try {
    errorTrigger(NotImplementError);
  } catch (err) {
    errorResponse(req, res)(err);
  }
});

auth.get('/signin', (req, res) => {
  try {
    errorTrigger(NotImplementError);
  } catch (err) {
    errorResponse(req, res)(err);
  }
});

export default auth;
