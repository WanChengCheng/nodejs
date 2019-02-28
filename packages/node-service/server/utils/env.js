/*
 * File: env.js
 * File Created: Monday, 5th November 2018 7:44:43 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */

export const isProductionEnv = process.env.NODE_ENV === 'production';

export const serviceName = process.env.SERVICE_NAME || 'not-specified';

export const jwtIssuer = process.env.SERVICE_JWT_ISSUER || process.env.SERVICE_NAME || 'not-specified';

export const jwtSecret = process.env.SERVICE_JWT_SECRET || 'nopassword';

export default process.env;
