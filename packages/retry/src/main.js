/*
 * File: main.js
 * File Created: Monday, 4th March 2019 8:37:01 pm
 * Author: ChegCheng Wan <chengcheng.st@gmail.com>
 */

export const retry = ({ times = 1, onFailure } = {}) => {
  const memory = { tried: 0 };
  return (task) => {
    const singleTry = (resolve, reject) => {
      (async () => {
        memory.tried += 1;
        const result = await task();
        return result;
      })()
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          if (onFailure) {
            onFailure({ error, tried: memory.tried });
          }
          if (memory.tried >= times) {
            return reject(Object.assign(error, { tried: memory.tried }));
          }
          return singleTry(resolve, reject);
        });
    };
    const trying = () => new Promise(singleTry);
    return trying();
  };
};

export const delay = (time = 1000) => task => () => new Promise((resolve, reject) => {
  setTimeout(() => {
    (async () => {
      const result = await task();
      return result;
    })()
      .then(resolve)
      .catch(reject);
  }, time);
});

export default retry;
