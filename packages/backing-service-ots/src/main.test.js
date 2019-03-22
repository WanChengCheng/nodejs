/*
 * File: main.test.js
 * File Created: Monday, 4th March 2019 8:35:34 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import test from 'ava';
import fun from './main';

test('it should work as expected', (t) => {
  t.truthy(!fun());
});
