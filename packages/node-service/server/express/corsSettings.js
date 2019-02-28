/*
 * File: corsSettings.js
 * File Created: Monday, 5th November 2018 6:28:16 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

import { isProductionEnv } from '../utils/env';

/* eslint max-len: 0 */

// Access-Control-Allow-Methods
// The Access-Control-Allow-Methods header specifies the method or methods allowed when accessing the resource.
const METHODS = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'];

// Access-Control-Expose-Headers
// The Access-Control-Expose-Headers header lets a server whitelist headers that browsers are allowed to access.
const EXPOSED_HEADERS = ['Link', 'X-API-Version'];

const config = (opts = {}) => {
  const {
    whitelist = [],
    skipWhiteList = !isProductionEnv,
    allowMethods = [],
    exposeHeaders = [],
  } = opts;
  const allowed = new Set(whitelist);
  return {
    origin: !skipWhiteList
      ? (origin, callback) => callback(null, allowed.has(origin) || allowed.has('*'))
      : true,
    methods: Array.from(new Set([...METHODS, ...allowMethods])).join(','),
    exposedHeaders: Array.from(new Set([...EXPOSED_HEADERS, ...exposeHeaders])),
    credentials: true,
  };
};

export default config;
