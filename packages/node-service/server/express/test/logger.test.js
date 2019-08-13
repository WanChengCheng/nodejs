/*
 * File: logger.test.js
 * File Created: Tuesday, 13th August 2019 12:22:44 pm
 * Author: ChengCheng Wan <chengcheng.st@gmail.com>
 */
import { cleanupedPinoRequestSerializer } from '../logger';

it('should be able to clean up given header fields with the serialzer', () => {
  expect(
    cleanupedPinoRequestSerializer()({
      headers: {
        a: '1',
        authorization: 'should be removed',
      },
    }),
  ).toEqual({
    headers: { a: '1' },
  });
});
