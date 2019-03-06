/*
 * File: index.js
 * File Created: Monday, 4th March 2019 4:30:06 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
export const ServerError = {
  code: 1,
  message: 'unexpected server error',
};

export const InvalidRequestError = {
  code: 2,
  message: 'request validation error',
};

export const UnauthorizedError = {
  code: 3,
  message: 'authentication or authorization error, check your token',
};

export const WIPError = {
  code: 10,
  message: 'endpoint work in progress',
};
