import test from 'ava';
import Joi from 'joi';
import validateRequest from '../validateRequest';
import { RequestValidationError } from '../../errors/codes';

test('validate request should work as expected', async (t) => {
  const testSchema = Joi.object().keys({
    int: Joi.number()
      .integer()
      .min(0)
      .max(100)
      .required(),
    boolean: Joi.boolean(),
  });
  const value = {
    int: '100',
  };
  const res = await validateRequest(value, testSchema);
  t.deepEqual(res, { int: 100 });
});

test.only('Joi usage test', async (t) => {
  const value = await validateRequest('true', Joi.boolean());
  t.is(value, true);

  const empty = await validateRequest(
    {},
    Joi.object().keys({
      a: Joi.string(),
      b: Joi.string(),
    }),
  );
  t.deepEqual(empty, {});
});

test('validate request should report formated error on invalid request values', async (t) => {
  const testSchema = Joi.object().keys({
    int: Joi.number()
      .integer()
      .min(0)
      .max(100)
      .required(),
  });
  const error = await t.throwsAsync(() => validateRequest({ int: 101 }, testSchema));
  t.is(error.code, RequestValidationError.code);
  t.truthy(error.message);
  t.truthy(error.details);
  t.deepEqual(error.details.fields, ['int']);
});
