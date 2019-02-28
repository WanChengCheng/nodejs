/*
 * File: validateRequest.js
 * File Created: Thursday, 29th November 2018 5:17:06 pm
 * Author: ChegCheng Wan (chengcheng.st@gmail.com)
 */
import Joi from 'joi';
import logger from '../utils/logger';
import errorTrigger from './errorTrigger';
import { RequestValidationError } from '../errors/codes';

/* eslint max-len: 0 */

/**
 * * Validate request input parameters
 * @param {Any} value - value to validate
 * @param {JoiSchema} schema - Joi Schema
 * @returns {Object} result - converted value
 * @throws RequestValidationError
 */
const validateRequest = (value, schema) => Joi.validate(value, schema, { convert: true }).catch((err) => {
  logger.trace(err, 'server validation error');
  const { message, details } = err;
  errorTrigger(RequestValidationError, {
    info: message,
    fields: details.reduce((res, { path }) => [...res, ...path], []).filter(Boolean),
  });
});

export default validateRequest;
