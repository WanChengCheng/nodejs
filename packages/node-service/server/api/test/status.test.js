import test from 'ava';
import status from '../status';

test('stauts should be 0 (OK)', (t) => {
  t.deepEqual(status(), { status: 0 });
});
