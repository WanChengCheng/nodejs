import test from 'ava';
import * as errors from '..';

test('errors should be defined with code and message', (t) => {
  Object.keys(errors).forEach((name) => {
    t.truthy(errors[name].code);
    t.truthy(errors[name].message);
  });
});
