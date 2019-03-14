/*
 * File: main.js
 * File Created: Thursday, 14th March 2019 9:00:56 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

const serial = funcs =>
  funcs.reduce(
    (promise, func) =>
      promise.then(result => func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([])
  );

const delay = (time = 1000) => task => () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      (async () => {
        const result = await task();
        return result;
      })()
        .then(resolve)
        .catch(reject);
    }, time);
  });

module.exports = {
  serial,
  delay
};
