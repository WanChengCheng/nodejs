/*
 * File: main.test.js
 * File Created: Monday, 4th March 2019 8:35:34 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */
import { retry, delay } from "./main";

const willFail = (times = 1) => result => {
  const already = { failed: 0 };
  const again = () =>
    new Promise((resolve, reject) => {
      if (already.failed >= times) {
        resolve(result);
      } else {
        already.failed += 1;
        reject(Error(`this is the ${already.failed} time to fail as intended`));
      }
    });
  return again;
};

test("it should work as expected", async () => {
  const result = await retry({ times: 3 })(willFail(2)("final result"));
  expect(result).toEqual("final result");
});

test("delayed call", async () => {
  const delayed = delay(1000)(() => 5);
  const result = await delayed();
  expect(result).toEqual(5);
});
