/*
 * File: server.js
 * File Created: Monday, 5th November 2018 4:33:44 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

import express, { Router } from 'express';
import compression from 'compression';
import responseTime from 'response-time';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import pino from 'express-pino-logger';
import errorhandler from 'errorhandler';
import helmet from 'helmet';
import uuid from 'uuid/v4';
import cors from 'cors';
import { createPinoLogger } from './logger';
import configCors from './configCors';

export const createService = ({
  isProductionEnv = () => process.env.NODE_ENV === 'production',
  corsSetting = configCors()({
    whitelist: ['*'],
  }),
  disableExpressPinoLogger = false,
  logger = createPinoLogger(),
  pinoSerializers,
  bodyLimit = '1mb',
} = {}) => {
  const isProduction = isProductionEnv();
  const server = express();
  const service = Router();

  /* eslint max-len: 0 */

  // the client’s IP address is understood as the left-most entry in the X-Forwarded-* header.
  //  otherwise the app is understood as directly facing the Internet
  //  and the client’s IP address is derived from req.connection.remoteAddress.
  server.enable('trust proxy');

  // requests that pass through the middleware will be compressed,
  //  see #https://www.npmjs.com/package/compression for more details
  server.use(compression());

  // Create a middleware that adds a X-Response-Time header to responses.
  //  see #https://www.npmjs.com/package/response-time
  server.use(responseTime());

  // parse body
  // parse application/x-www-form-urlencoded
  // The extended option allows to choose between parsing the URL-encoded data with the querystring library (when false) or the qs library (when true).
  // The "extended" syntax allows for rich objects and arrays to be encoded into the URL-encoded format, allowing for a JSON-like experience with URL-encoded.
  server.use(bodyParser.urlencoded({ extended: true, limit: bodyLimit }));
  // parse application/json
  server.use(bodyParser.json({ limit: bodyLimit }));

  // parse cookie
  // Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
  server.use(cookieParser());

  // helmet
  // Helmet helps you secure your Express apps by setting various HTTP headers.
  server.use(
    helmet({
      // The X-Frame-Options header tells browsers to prevent your webpage from being put in an iframe.
      frameguard: true,
      // noSniff, helps prevent browsers from trying to guess (“sniff”) the MIME type, which can have security implications.
      //  #see http://www.adambarth.com/papers/2009/barth-caballero-song.pdf for more details
      noSniff: true,
      // Hide Powered-By middleware removes the X-Powered-By header to make it slightly harder for attackers to see what potentially-vulnerable technology powers your site.
      hidePoweredBy: true,
      // sets the X-Download-Options to prevent Internet Explorer from executing downloads in your site’s context.
      ieNoOpen: true,
      // sets the X-XSS-Protection header to prevent reflected XSS attacks.
      xssFilter: true,
    }),
  );

  // cors
  server.use(cors(corsSetting));

  const healthCheck = (_, res) => {
    res.json({
      status: 0,
      live: true,
    });
  };

  server.get('/', healthCheck);

  if (!disableExpressPinoLogger) {
    // logger
    // express-pino-logger has the same options of pino
    server.use(
      pino({
        logger,
        // express-pino-logger is just pino-http,
        genReqId: () => uuid(),
        serializers: {
          req: pino.stdSerializers.req,
          res: pino.stdSerializers.res,
          ...(pinoSerializers || {}),
        },
      }),
    );
  } else {
    // attach a logger to req,
    server.use((req, res, next) => {
      req.log = logger;
      next();
    });
  }

  // add a X-Request-Id header for each request
  server.use((req, res, next) => {
    if (!req.id) {
      req.id = uuid();
    }
    res.set('X-Request-Id', req.id);
    next();
  });

  server.use(service);

  // errorhandler, for deveopment
  if (!isProduction) {
    server.use(errorhandler());
  }

  return {
    server,
    service,
    logger,
  };
};

/**
 * * wait for service events
 * @param {*} app, express app
 * @param {*} event, server events, EVENT_*
 */
export const waitFor = (app, event) => new Promise((resolve) => {
  app.on(event, resolve);
});

export const EVENT_SERVICES_CONNECTED = 'ServicesConnected';

export const EVENT_SERVER_READY = 'ServerStarted';

export const bootstrapService = ({
  server, logger = console, port = 80, connectResources,
}) => connectResources(logger).then(() => {
  server.emit(EVENT_SERVICES_CONNECTED);
  logger.info('All services connected.');
  if (process.env.NODE_ENV !== 'test' && process.env.NO_LISTEN !== 'yes') {
    server.listen(port, () => {
      logger.info(`Server started on port ${port} in ${server.get('env')} mode`);
      server.emit(EVENT_SERVER_READY);
    });
  } else {
    logger.info('Server started but not listening');
  }
});
export default createService;
