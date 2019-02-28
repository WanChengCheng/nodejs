import test from 'ava';
import errorTrigger from '../errorTrigger';
import { RequestValidationError } from '../../errors/codes';

test('trigger error with errorTrigger', (t) => {
  const err = t.throws(() => {
    errorTrigger(RequestValidationError);
  });
  t.is(err.message, RequestValidationError.message);
  t.is(err.code, RequestValidationError.code);
});

test('error trigger with more info', (t) => {
  const err = t.throws(() => {
    errorTrigger(RequestValidationError, {
      info: 'some extra information',
    });
  });
  t.is(err.details.info, 'some extra information');
});
