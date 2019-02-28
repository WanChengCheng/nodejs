import test from 'ava';
import errorTrigger from '../errorTrigger';
import { RequestValidationError } from '../../errors';
import errorResponse from '../errorResponse';

test('handle triggered error as expected', (t) => {
  const err = t.throws(() => errorTrigger(RequestValidationError, {
    hint: 'please check your input',
  }));
  errorResponse(
    {
      log: {
        error: (tolog) => {
          t.truthy(tolog);
        },
      },
    },
    {
      json: (result) => {
        t.deepEqual(result, {
          status: RequestValidationError.code,
          message: RequestValidationError.message,
          details: {
            hint: 'please check your input',
          },
        });
      },
    },
  )(err);
});
