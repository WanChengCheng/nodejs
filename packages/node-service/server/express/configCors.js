/*
 * File: configCors.js
 * File Created: Monday, 5th November 2018 6:28:16 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

/* eslint max-len: 0 */
export const configCors = ({
  isProductionEnv = () => process.env.NODE_ENV === 'production',
  // Access-Control-Allow-Methods
  // The Access-Control-Allow-Methods header specifies the method or methods allowed when accessing the resource.
  defaultMethods = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],

  // Access-Control-Expose-Headers
  // The Access-Control-Expose-Headers header lets a server whitelist headers that browsers are allowed to access.
  defaultExposedHeaders = ['Link', 'X-API-Version'],
} = {}) => (opts = {}) => {
  const isProduction = isProductionEnv();
  const {
    whitelist = [],
    skipWhiteList = !isProduction,
    allowMethods = [],
    exposeHeaders = [],
  } = opts;
  const allowed = new Set(whitelist);
  return {
    origin: !skipWhiteList
      ? (origin, callback) => callback(null, allowed.has(origin) || allowed.has('*'))
      : true,
    methods: Array.from(new Set([...defaultMethods, ...allowMethods])).join(','),
    exposedHeaders: Array.from(new Set([...defaultExposedHeaders, ...exposeHeaders])),
    credentials: true,
  };
};

export default configCors;
