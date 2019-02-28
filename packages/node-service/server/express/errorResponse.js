/*
 * File: errorResponse.js
 * File Created: Friday, 9th November 2018 12:01:05 am
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */
import { RequestValidationError, DefaultError } from '../errors/codes';

const buildResponse = (info) => {
  const { code, message, details = {} } = info;
  return {
    status: code,
    message,
    details,
  };
};
// handle defined/undefined errors and express-validator errors
const errorResponse = (req, res) => (err, message = 'application error') => {
  // log error
  const { log } = req;
  log.error({ message, err });
  // construct response
  if (typeof err.array === 'function') {
    // handle express-validator errors
    return res.json(buildResponse({ ...RequestValidationError, details: err.array() }));
  }
  if (err.code) {
    // handle defined errors
    return res.json(buildResponse(err));
  }
  // unexpected errors
  return res.json(
    buildResponse({
      ...DefaultError,
    }),
  );
};

export default errorResponse;
