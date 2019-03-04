/*
 * File: validateRequest.js
 * File Created: Thursday, 29th November 2018 5:17:06 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */
import Joi from 'joi';
import errorTrigger from './errorTrigger';
import { InvalidRequestError } from './errors';

/* eslint max-len: 0 */

/**
 * * Validate request input parameters
 * @param {Any} value - value to validate
 * @param {JoiSchema} schema - Joi Schema
 * @returns {Object} result - converted value
 * @throws RequestValidationError
 */
export const validateRequest = (value, schema, tracer) => Joi.validate(value, schema, { convert: true }).catch((err) => {
  if (tracer) {
    tracer(err);
  }
  const { message, details } = err;
  errorTrigger(InvalidRequestError, {
    info: message,
    fields: details.reduce((res, { path }) => [...res, ...path], []).filter(Boolean),
  });
});

export default validateRequest;
