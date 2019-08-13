/*
 * File: authentication.js
 * File Created: Thursday, 8th November 2018 6:39:16 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

/* eslint max-len: 0 */
import jwt from 'jsonwebtoken';
import jwtMiddleware from 'express-jwt';
import { UnauthorizedError } from './errors';

export const jwtFromRequest = (req) => {
  const {
    headers: { authorization },
  } = req;
  const [type, content] = authorization ? authorization.split(' ') : [];
  if (type === 'Bearer') {
    return content;
  }
  return null;
};

export class UnregisteredIssuerError extends Error {}

// name should be the name of the service (full name, not issuer),
//      name should be configured as SERVICE_NAME for each service component
//      that are recognizable among each other.
export const tokenSigner = (getServiceIdentities) => (name) => (content = {}, options = {}) => getServiceIdentities()
  .then((services) => {
    const service = services.find((item) => item.name === name);
    if (!service) {
      throw Error(`Secret missing for ${name}`);
    }
    return service;
  })
  .then(
    ({ secret, issuer }) => new Promise((resolve, reject) => {
      jwt.sign(
        {
          ...content,
        },
        secret,
        {
          issuer,
          ...options,
        },
        (err, res) => (err ? reject(err) : resolve(res)),
      );
    }),
  );

/**
 * HOF to generate function to be used by express-jwt to support multi-tenancy.
 * Check expres-jwt's documents for more details.
 *
 * @param {function} getServiceIdentities - async function, should return 'service identities'.
 * @param {boolean} disableCredential     - will disable JWT token protection if given.
 */
export const multitenancy = (getServiceIdentities, disableCredential = false) => function secretCallback(req, payload = {}, done) {
  // the secretcallback must be a named function (cannot be async arrow function due to a bug of express-jwt)
  return getServiceIdentities().then((services) => {
    const issuer = payload.iss || payload.issuer;
    if (!issuer) {
      return done(new UnregisteredIssuerError('no issuer in token'));
    }
    const { secret } = services.find((item) => item.issuer === issuer) || {};
    if (secret) {
      return done(null, secret);
    }
    if (!disableCredential) {
      return done(new UnregisteredIssuerError(`unknown issuer ${issuer}`), null);
    }
    return done(null, null);
  });
};

/**
 * Generate 'authorized' express middleware to handle(parse) JWT in request headers.
 * Generate 'unauthorized' express middleware to handle unauthorized request, i.e, 401 with given message.
 *
 * @param {object} config
 * @param {String} config.jwtSecret - secret to sign & varify tokens
 */
export const createAuthMiddleware = ({
  jwtSecret,
  credentialsRequired = true,
  queryTokenName = 'token',
  getToken,
  publicPath = [],
  unauthorizedMessage = 'INVALID TOKEN',
  isRevoked,
} = {}) => {
  const secretFromHeaderOrQuery = (req) => {
    const {
      headers: { authorization },
      query: { [queryTokenName]: token },
    } = req;
    const [type, content] = authorization ? authorization.split(' ') : [];
    if (type === 'Bearer') {
      return content;
    }
    if (token) {
      return token;
    }
    return null;
  };

  return {
    authorized: jwtMiddleware({
      secret: jwtSecret,
      credentialsRequired,
      getToken: getToken || secretFromHeaderOrQuery,
      isRevoked,
    }).unless({
      path: publicPath,
    }),

    unauthorized(err, req, res, next) {
      if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
          status: UnauthorizedError.code,
          message: unauthorizedMessage,
          details: err.message,
        });
      }
      if (err instanceof UnregisteredIssuerError) {
        return res.status(401).json({
          status: UnauthorizedError.code,
          message: err.message,
        });
      }
      return next(err);
    },
  };
};

export default createAuthMiddleware;
